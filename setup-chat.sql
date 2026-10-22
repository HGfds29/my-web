-- ============================================================
-- 聊天室全套表结构 + RLS + realtime（幂等，可重复运行）
-- 使用前请先到 Supabase Dashboard → Authentication → Providers
-- 关闭 "Confirm email"，否则注册后需邮箱验证才能登录。
-- ============================================================

-- ============ 第一阶段：创建所有表 ============

-- 用户资料（注册时自动创建）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists is_admin boolean not null default false;

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles(id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 公共聊天室
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);
alter table public.messages drop column if exists nickname;
alter table public.messages add column if not exists username text not null default '匿名';
alter table public.messages add column if not exists content text not null default '';
alter table public.messages add column if not exists image_url text;
alter table public.messages add column if not exists client_id uuid;
alter table public.messages add column if not exists user_id uuid;
alter table public.messages alter column username drop default;
alter table public.messages alter column content drop default;

-- 好友请求
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  unique(from_user, to_user)
);

-- 好友关系
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_a, user_b)
);

-- 私聊消息
create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  client_id uuid
);

-- 群聊
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
alter table public.group_members add column if not exists role text not null default 'member';
alter table public.group_members drop constraint if exists group_members_role_check;
alter table public.group_members add constraint group_members_role_check check (role in ('owner','admin','member'));

create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  client_id uuid
);

-- 封禁记录（全局封禁，被封用户无法发任何消息）
create table if not exists public.bans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  banned_by uuid not null references public.profiles(id) on delete cascade,
  reason text,
  is_permanent boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============ 第二阶段：RLS 策略（所有表已存在，避免前向引用） ============

-- 用 SECURITY DEFINER 函数做归属判断，绕过 RLS，避免策略自引用导致递归（42P17）
create or replace function public.is_group_member(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

create or replace function public.is_group_owner(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.groups
    where id = gid and owner = auth.uid()
  );
$$;

create or replace function public.is_group_admin(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid() and role in ('owner', 'admin')
  );
$$;

create or replace function public.is_app_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

alter table public.profiles enable row level security;
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles update" on public.profiles;
create policy "profiles update" on public.profiles for update to authenticated using (id = auth.uid());
-- 兜底：触发器未生效时，允许用户自己创建资料
drop policy if exists "profiles insert" on public.profiles;
create policy "profiles insert" on public.profiles for insert to authenticated with check (id = auth.uid());

drop policy if exists "chat read" on public.messages;
drop policy if exists "chat insert" on public.messages;
drop policy if exists "chat delete" on public.messages;
alter table public.messages enable row level security;
create policy "chat read" on public.messages for select to anon, authenticated using (true);
create policy "chat insert" on public.messages for insert to anon, authenticated with check (
  char_length(username) between 1 and 12
  and char_length(coalesce(content,'')) between 0 and 200
  and (user_id is null or user_id = auth.uid())
);
create policy "chat delete" on public.messages for delete to anon, authenticated
  using (user_id = auth.uid()
         or (client_id is not null
             and client_id = (current_setting('request.headers', true)::jsonb->>'x-client-id')::uuid
             and user_id is null)
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

alter table public.friend_requests enable row level security;
drop policy if exists "fr read" on public.friend_requests;
create policy "fr read" on public.friend_requests for select to authenticated
  using (from_user = auth.uid() or to_user = auth.uid());
drop policy if exists "fr insert" on public.friend_requests;
create policy "fr insert" on public.friend_requests for insert to authenticated
  with check (from_user = auth.uid());
drop policy if exists "fr update" on public.friend_requests;
create policy "fr update" on public.friend_requests for update to authenticated
  using (to_user = auth.uid()) with check (to_user = auth.uid());

alter table public.friendships enable row level security;
drop policy if exists "fs read" on public.friendships;
create policy "fs read" on public.friendships for select to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());
drop policy if exists "fs insert" on public.friendships;
create policy "fs insert" on public.friendships for insert to authenticated
  with check (user_a = auth.uid() or user_b = auth.uid());

alter table public.dm_messages enable row level security;
drop policy if exists "dm read" on public.dm_messages;
create policy "dm read" on public.dm_messages for select to authenticated
  using (from_user = auth.uid() or to_user = auth.uid());
drop policy if exists "dm insert" on public.dm_messages;
create policy "dm insert" on public.dm_messages for insert to authenticated
  with check (from_user = auth.uid());
drop policy if exists "dm delete" on public.dm_messages;
create policy "dm delete" on public.dm_messages for delete to authenticated
  using (((from_user = auth.uid() or to_user = auth.uid())
          and client_id = (current_setting('request.headers', true)::jsonb->>'x-client-id')::uuid)
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

alter table public.groups enable row level security;
drop policy if exists "gr read" on public.groups;
create policy "gr read" on public.groups for select to authenticated using (
  public.is_group_member(id)
);
drop policy if exists "gr insert" on public.groups;
create policy "gr insert" on public.groups for insert to authenticated with check (owner = auth.uid());

alter table public.group_members enable row level security;
drop policy if exists "gm read" on public.group_members;
create policy "gm read" on public.group_members for select to authenticated using (
  user_id = auth.uid() or public.is_group_member(group_id)
);
drop policy if exists "gm insert" on public.group_members;
create policy "gm insert" on public.group_members for insert to authenticated with check (
  user_id = auth.uid() or public.is_group_owner(group_id)
);
-- 群主可修改成员角色（任命/撤销管理员）
drop policy if exists "gm update" on public.group_members;
create policy "gm update" on public.group_members for update to authenticated using (
  public.is_group_owner(group_id) or public.is_app_admin()
);
-- 群主/管理员可踢人（不能踢群主自己）
drop policy if exists "gm delete" on public.group_members;
create policy "gm delete" on public.group_members for delete to authenticated using (
  public.is_app_admin()
  or public.is_group_owner(group_id)
  or (public.is_group_admin(group_id) and role <> 'owner')
);

alter table public.group_messages enable row level security;
drop policy if exists "gmess read" on public.group_messages;
create policy "gmess read" on public.group_messages for select to authenticated using (
  public.is_group_member(group_id)
);
drop policy if exists "gmess insert" on public.group_messages;
create policy "gmess insert" on public.group_messages for insert to authenticated with check (
  user_id = auth.uid() and public.is_group_member(group_id)
);
drop policy if exists "gmess delete" on public.group_messages;
create policy "gmess delete" on public.group_messages for delete to authenticated using (
  (user_id = auth.uid()
   and client_id = (current_setting('request.headers', true)::jsonb->>'x-client-id')::uuid)
  or public.is_app_admin()
  or public.is_group_admin(group_id)
);

-- 封禁表：管理员可增删，用户只能看自己是否被封
alter table public.bans enable row level security;
drop policy if exists "bans read" on public.bans;
create policy "bans read" on public.bans for select to authenticated using (
  user_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);
drop policy if exists "bans insert" on public.bans;
create policy "bans insert" on public.bans for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  and banned_by = auth.uid()
);
drop policy if exists "bans delete" on public.bans;
create policy "bans delete" on public.bans for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- ============ 第三阶段：realtime + 存储 ============

do $$
begin
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='dm_messages') then
    alter publication supabase_realtime add table public.dm_messages;
  end if;
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='group_messages') then
    alter publication supabase_realtime add table public.group_messages;
  end if;
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='friend_requests') then
    alter publication supabase_realtime add table public.friend_requests;
  end if;
end $$;

insert into storage.buckets (id, name, public)
  values ('chat-images', 'chat-images', true) on conflict (id) do nothing;

drop policy if exists "chat images upload" on storage.objects;
create policy "chat images upload" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'chat-images');

drop policy if exists "chat images read" on storage.objects;
create policy "chat images read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'chat-images');
