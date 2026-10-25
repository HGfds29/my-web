-- ============================================================
-- 讨论区：文章 + 评论
-- 依赖 setup-chat.sql 中的 profiles 表与 is_app_admin() 函数
-- 可重复执行
-- ============================================================

-- 文章
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  details text not null default '',
  pinned boolean not null default false,
  tags text[] not null default '{}',
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add column if not exists details text not null default '';
alter table public.posts add column if not exists pinned boolean not null default false;
alter table public.posts add column if not exists tags text[] not null default '{}';
alter table public.posts add column if not exists cover_url text;

-- 评论
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.post_comments(id) on delete cascade,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.post_comments add column if not exists parent_id uuid references public.post_comments(id) on delete cascade;
alter table public.post_comments add column if not exists image_url text;

-- 评论点赞
create table if not exists public.post_comment_likes (
  comment_id uuid not null references public.post_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create index if not exists posts_created_idx on public.posts (created_at desc);
create index if not exists posts_pinned_idx on public.posts (pinned desc, created_at desc);
create index if not exists post_comments_post_idx on public.post_comments (post_id, created_at);
create index if not exists post_comments_parent_idx on public.post_comments (parent_id);

alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_comment_likes enable row level security;

-- ---------- 文章策略：所有人可读，仅管理员可写/删 ----------
drop policy if exists "posts read" on public.posts;
create policy "posts read" on public.posts
  for select to anon, authenticated using (true);

drop policy if exists "posts insert admin" on public.posts;
create policy "posts insert admin" on public.posts
  for insert to authenticated
  with check (public.is_app_admin() and author_id = auth.uid());

drop policy if exists "posts update admin" on public.posts;
create policy "posts update admin" on public.posts
  for update to authenticated using (public.is_app_admin());

drop policy if exists "posts delete admin" on public.posts;
create policy "posts delete admin" on public.posts
  for delete to authenticated using (public.is_app_admin());

-- ---------- 评论策略：所有人可读，登录用户可评论，本人或管理员可删 ----------
drop policy if exists "comments read" on public.post_comments;
create policy "comments read" on public.post_comments
  for select to anon, authenticated using (true);

drop policy if exists "comments insert" on public.post_comments;
create policy "comments insert" on public.post_comments
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "comments delete" on public.post_comments;
create policy "comments delete" on public.post_comments
  for delete to authenticated
  using (user_id = auth.uid() or public.is_app_admin());

-- ---------- 点赞策略：所有人可读，登录用户只能点赞/取消自己的 ----------
drop policy if exists "likes read" on public.post_comment_likes;
create policy "likes read" on public.post_comment_likes
  for select to anon, authenticated using (true);

drop policy if exists "likes insert" on public.post_comment_likes;
create policy "likes insert" on public.post_comment_likes
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "likes delete" on public.post_comment_likes;
create policy "likes delete" on public.post_comment_likes
  for delete to authenticated using (user_id = auth.uid());

-- 让 PostgREST 立即刷新 schema 缓存（新增列后避免报 "column does not exist"）
notify pgrst, 'reload schema';
