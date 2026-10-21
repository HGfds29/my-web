import { createClient } from '@supabase/supabase-js'

/**
 * Supabase 聊天室配置（publishable key 可安全暴露在前端）。
 *
 * 首次使用前需在 Supabase SQL Editor 执行下面这段幂等脚本。
 * 注意：启用登录后，请到 Supabase Dashboard → Authentication → Providers
 *       将 "Confirm email" 关闭，否则注册后需邮箱验证才能登录。
 *
 * ------------------------------------------------------------------
 *
 * -- ===== 用户资料（注册时自动创建） =====
 * create table if not exists public.profiles (
 *   id uuid primary key references auth.users(id) on delete cascade,
 *   username text unique not null,
 *   created_at timestamptz not null default now()
 * );
 *
 * create or replace function public.handle_new_user() returns trigger as $$
 * begin
 *   insert into public.profiles(id, username)
 *   values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)))
 *   on conflict (id) do nothing;
 *   return new;
 * end; $$ language plpgsql security definer;
 * drop trigger if exists on_auth_user_created on auth.users;
 * create trigger on_auth_user_created after insert on auth.users
 *   for each row execute function public.handle_new_user();
 *
 * alter table public.profiles enable row level security;
 * drop policy if exists "profiles read" on public.profiles;
 * create policy "profiles read" on public.profiles for select to authenticated using (true);
 * drop policy if exists "profiles update" on public.profiles;
 * create policy "profiles update" on public.profiles for update to authenticated using (id = auth.uid());
 *
 * -- ===== 公共聊天室（保留原有匿名公共聊天） =====
 * create table if not exists public.messages (
 *   id uuid primary key default gen_random_uuid(),
 *   created_at timestamptz not null default now()
 * );
 * alter table public.messages drop column if exists nickname;
 * alter table public.messages add column if not exists username text not null default '匿名';
 * alter table public.messages add column if not exists content text not null default '';
 * alter table public.messages add column if not exists image_url text;
 * alter table public.messages add column if not exists client_id uuid;
 * alter table public.messages alter column username drop default;
 * alter table public.messages alter column content drop default;
 *
 * drop policy if exists "chat read" on public.messages;
 * drop policy if exists "chat insert" on public.messages;
 * drop policy if exists "chat delete" on public.messages;
 * alter table public.messages enable row level security;
 * create policy "chat read" on public.messages for select to anon, authenticated using (true);
 * create policy "chat insert" on public.messages for insert to anon, authenticated with check (
 *   char_length(username) between 1 and 12 and char_length(coalesce(content,'')) between 0 and 200
 * );
 * create policy "chat delete" on public.messages for delete to anon, authenticated
 *   using (client_id = (current_setting('request.headers', true)::jsonb->>'x-client-id')::uuid);
 *
 * -- ===== 好友请求 =====
 * create table if not exists public.friend_requests (
 *   id uuid primary key default gen_random_uuid(),
 *   from_user uuid not null references public.profiles(id) on delete cascade,
 *   to_user uuid not null references public.profiles(id) on delete cascade,
 *   status text not null default 'pending' check (status in ('pending','accepted','rejected')),
 *   created_at timestamptz not null default now(),
 *   unique(from_user, to_user)
 * );
 * alter table public.friend_requests enable row level security;
 * drop policy if exists "fr read" on public.friend_requests;
 * create policy "fr read" on public.friend_requests for select to authenticated
 *   using (from_user = auth.uid() or to_user = auth.uid());
 * drop policy if exists "fr insert" on public.friend_requests;
 * create policy "fr insert" on public.friend_requests for insert to authenticated
 *   with check (from_user = auth.uid());
 * drop policy if exists "fr update" on public.friend_requests;
 * create policy "fr update" on public.friend_requests for update to authenticated
 *   using (to_user = auth.uid()) with check (to_user = auth.uid());
 *
 * -- ===== 好友关系 =====
 * create table if not exists public.friendships (
 *   id uuid primary key default gen_random_uuid(),
 *   user_a uuid not null references public.profiles(id) on delete cascade,
 *   user_b uuid not null references public.profiles(id) on delete cascade,
 *   created_at timestamptz not null default now(),
 *   unique(user_a, user_b)
 * );
 * alter table public.friendships enable row level security;
 * drop policy if exists "fs read" on public.friendships;
 * create policy "fs read" on public.friendships for select to authenticated
 *   using (user_a = auth.uid() or user_b = auth.uid());
 * drop policy if exists "fs insert" on public.friendships;
 * create policy "fs insert" on public.friendships for insert to authenticated
 *   with check (user_a = auth.uid() or user_b = auth.uid());
 *
 * -- ===== 私聊消息（天然支持离线：对方上线拉取历史） =====
 * create table if not exists public.dm_messages (
 *   id uuid primary key default gen_random_uuid(),
 *   from_user uuid not null references public.profiles(id) on delete cascade,
 *   to_user uuid not null references public.profiles(id) on delete cascade,
 *   content text not null default '',
 *   image_url text,
 *   created_at timestamptz not null default now(),
 *   client_id uuid
 * );
 * alter table public.dm_messages enable row level security;
 * drop policy if exists "dm read" on public.dm_messages;
 * create policy "dm read" on public.dm_messages for select to authenticated
 *   using (from_user = auth.uid() or to_user = auth.uid());
 * drop policy if exists "dm insert" on public.dm_messages;
 * create policy "dm insert" on public.dm_messages for insert to authenticated
 *   with check (from_user = auth.uid());
 * drop policy if exists "dm delete" on public.dm_messages;
 * create policy "dm delete" on public.dm_messages for delete to authenticated
 *   using ((from_user = auth.uid() or to_user = auth.uid())
 *          and client_id = (current_setting('request.headers', true)::jsonb->>'x-client-id')::uuid);
 *
 * -- ===== 群聊 =====
 * create table if not exists public.groups (
 *   id uuid primary key default gen_random_uuid(),
 *   name text not null,
 *   owner uuid not null references public.profiles(id) on delete cascade,
 *   created_at timestamptz not null default now()
 * );
 * alter table public.groups enable row level security;
 * drop policy if exists "gr read" on public.groups;
 * create policy "gr read" on public.groups for select to authenticated using (
 *   exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
 * );
 * drop policy if exists "gr insert" on public.groups;
 * create policy "gr insert" on public.groups for insert to authenticated with check (owner = auth.uid());
 *
 * create table if not exists public.group_members (
 *   group_id uuid not null references public.groups(id) on delete cascade,
 *   user_id uuid not null references public.profiles(id) on delete cascade,
 *   joined_at timestamptz not null default now(),
 *   primary key (group_id, user_id)
 * );
 * alter table public.group_members enable row level security;
 * drop policy if exists "gm read" on public.group_members;
 * create policy "gm read" on public.group_members for select to authenticated using (
 *   user_id = auth.uid() or exists (
 *     select 1 from public.group_members gm2
 *     where gm2.group_id = group_members.group_id and gm2.user_id = auth.uid()
 *   )
 * );
 * drop policy if exists "gm insert" on public.group_members;
 * create policy "gm insert" on public.group_members for insert to authenticated with check (
 *   user_id = auth.uid() or exists (
 *     select 1 from public.groups g where g.id = group_members.group_id and g.owner = auth.uid()
 *   )
 * );
 *
 * create table if not exists public.group_messages (
 *   id uuid primary key default gen_random_uuid(),
 *   group_id uuid not null references public.groups(id) on delete cascade,
 *   user_id uuid not null references public.profiles(id) on delete cascade,
 *   content text not null default '',
 *   image_url text,
 *   created_at timestamptz not null default now(),
 *   client_id uuid
 * );
 * alter table public.group_messages enable row level security;
 * drop policy if exists "gmess read" on public.group_messages;
 * create policy "gmess read" on public.group_messages for select to authenticated using (
 *   exists (select 1 from public.group_members gm where gm.group_id = group_messages.group_id and gm.user_id = auth.uid())
 * );
 * drop policy if exists "gmess insert" on public.group_messages;
 * create policy "gmess insert" on public.group_messages for insert to authenticated with check (
 *   exists (select 1 from public.group_members gm where gm.group_id = group_messages.group_id and gm.user_id = auth.uid())
 * );
 * drop policy if exists "gmess delete" on public.group_messages;
 * create policy "gmess delete" on public.group_messages for delete to authenticated using (
 *   user_id = auth.uid()
 *   and client_id = (current_setting('request.headers', true)::jsonb->>'x-client-id')::uuid
 * );
 *
 * -- ===== realtime =====
 * do $$
 * begin
 *   if not exists (select 1 from pg_publication_tables
 *     where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then
 *     alter publication supabase_realtime add table public.messages;
 *   end if;
 *   if not exists (select 1 from pg_publication_tables
 *     where pubname='supabase_realtime' and schemaname='public' and tablename='dm_messages') then
 *     alter publication supabase_realtime add table public.dm_messages;
 *   end if;
 *   if not exists (select 1 from pg_publication_tables
 *     where pubname='supabase_realtime' and schemaname='public' and tablename='group_messages') then
 *     alter publication supabase_realtime add table public.group_messages;
 *   end if;
 *   if not exists (select 1 from pg_publication_tables
 *     where pubname='supabase_realtime' and schemaname='public' and tablename='friend_requests') then
 *     alter publication supabase_realtime add table public.friend_requests;
 *   end if;
 * end $$;
 *
 * -- ===== 图片存储桶（公开读） =====
 * insert into storage.buckets (id, name, public)
 *   values ('chat-images', 'chat-images', true) on conflict (id) do nothing;
 * drop policy if exists "chat images upload" on storage.objects;
 * create policy "chat images upload" on storage.objects
 *   for insert to anon, authenticated with check (bucket_id = 'chat-images');
 * drop policy if exists "chat images read" on storage.objects;
 * create policy "chat images read" on storage.objects
 *   for select to anon, authenticated using (bucket_id = 'chat-images');
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const CLIENT_ID_KEY = 'chat_client_id'
let clientId = localStorage.getItem(CLIENT_ID_KEY)
if (!clientId) {
  clientId =
    crypto.randomUUID?.() ||
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  localStorage.setItem(CLIENT_ID_KEY, clientId)
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { headers: { 'x-client-id': clientId } },
  // 邮箱确认链接会带 #access_token=... 回到站点，hash 路由会误判成路径，
  // 因此关闭自动解析，由 main.js 显式处理。
  auth: { detectSessionInUrl: false }
})

export const chatClientId = clientId
