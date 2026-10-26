-- ============================================================
-- 站点日志表：前端控制台日志落库，只保留 2 天
-- 按批次存储：一次上传写一行，行内 logs 为 JSON 数组
-- 在 Supabase Dashboard → SQL Editor 中整段执行即可（可重复执行）
-- ============================================================

create table if not exists public.site_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id uuid,
  user_id uuid,
  client_id uuid,
  page text,
  user_agent text,
  log_count int not null default 1,
  levels text[],
  logs jsonb not null default '[]'::jsonb
);

-- 兼容旧版本表结构（旧表已存在时补齐批次相关字段）
alter table public.site_logs add column if not exists session_id uuid;
alter table public.site_logs add column if not exists user_id uuid;
alter table public.site_logs add column if not exists client_id uuid;
alter table public.site_logs add column if not exists page text;
alter table public.site_logs add column if not exists user_agent text;
alter table public.site_logs add column if not exists log_count int not null default 1;
alter table public.site_logs add column if not exists levels text[];
alter table public.site_logs add column if not exists logs jsonb not null default '[]'::jsonb;

-- 旧版本是「一条日志一行」，这里清掉旧格式数据，统一改为批次存储
delete from public.site_logs where logs is null or jsonb_array_length(logs) = 0;

-- 旧版本的列会被新代码忽略，直接删掉，避免表格里出现大量 null
drop policy if exists "site logs insert" on public.site_logs;
alter table public.site_logs drop column if exists level;
alter table public.site_logs drop column if exists scope;
alter table public.site_logs drop column if exists message;
alter table public.site_logs drop column if exists detail;

alter table public.site_logs alter column logs set default '[]'::jsonb;
alter table public.site_logs alter column logs set not null;

create index if not exists site_logs_created_at_idx on public.site_logs (created_at desc);

alter table public.site_logs enable row level security;

-- ===== 写入：匿名与登录用户都可以上报日志（一次一行，行为一批） =====
drop policy if exists "site logs insert" on public.site_logs;
create policy "site logs insert" on public.site_logs
  for insert to anon, authenticated
  with check (
    jsonb_typeof(logs) = 'array'
    and jsonb_array_length(logs) between 1 and 200
    and char_length(coalesce(page, '')) <= 600
    and char_length(coalesce(user_agent, '')) <= 600
  );

-- ===== 读取：仅管理员可查看 =====
drop policy if exists "site logs read admin" on public.site_logs;
create policy "site logs read admin" on public.site_logs
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ===== 删除：只允许删除超过 2 天的记录（前端启动时顺带清理） =====
drop policy if exists "site logs delete expired" on public.site_logs;
create policy "site logs delete expired" on public.site_logs
  for delete to anon, authenticated
  using (created_at < now() - interval '2 days');

-- ===== 可选：启用 pg_cron 时每天自动清理（未安装则自动跳过） =====
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'purge-site-logs',
      '0 4 * * *',
      $cron$ delete from public.site_logs where created_at < now() - interval '2 days' $cron$
    );
  end if;
exception
  when others then
    raise notice 'pg_cron 自动清理设置跳过：%', sqlerrm;
end $$;

notify pgrst, 'reload schema';
