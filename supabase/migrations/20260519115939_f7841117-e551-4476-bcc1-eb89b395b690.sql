
-- Roles
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Auto profile + default user role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- Domain tables
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(10,3) not null default 0,
  old_price numeric(10,3),
  image_url text,
  stock int not null default 0,
  promo_badge text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  discount_percent int,
  category_id uuid references public.categories(id) on delete set null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger promotions_updated_at before update on public.promotions
for each row execute function public.set_updated_at();

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  description text,
  discount_percent int,
  discount_amount numeric(10,3),
  min_purchase numeric(10,3),
  usage_limit int,
  used_count int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger coupons_updated_at before update on public.coupons
for each row execute function public.set_updated_at();

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz not null default now()
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null default 'lottery', -- lottery|wheel|quiz
  image_url text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger competitions_updated_at before update on public.competitions
for each row execute function public.set_updated_at();

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  is_winner boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table public.wheel_spins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  prize_label text not null,
  prize_value text,
  is_winning boolean not null default false,
  spun_at timestamptz not null default now()
);

create table public.catalogues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  pdf_url text not null,
  cover_url text,
  page_count int,
  badge text,
  published_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.promotions enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.competitions enable row level security;
alter table public.participants enable row level security;
alter table public.wheel_spins enable row level security;
alter table public.catalogues enable row level security;

-- Profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles for all using (public.has_role(auth.uid(), 'admin'));

-- user_roles (only admins manage)
create policy "user_roles_select_own" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "user_roles_admin_all" on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

-- Public read tables
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all using (public.has_role(auth.uid(), 'admin'));

create policy "products_public_read" on public.products for select using (is_active = true or public.has_role(auth.uid(), 'admin'));
create policy "products_admin_write" on public.products for all using (public.has_role(auth.uid(), 'admin'));

create policy "promotions_public_read" on public.promotions for select using (is_active = true or public.has_role(auth.uid(), 'admin'));
create policy "promotions_admin_write" on public.promotions for all using (public.has_role(auth.uid(), 'admin'));

create policy "coupons_public_read" on public.coupons for select using (is_active = true or public.has_role(auth.uid(), 'admin'));
create policy "coupons_admin_write" on public.coupons for all using (public.has_role(auth.uid(), 'admin'));

create policy "coupon_redemptions_select_own" on public.coupon_redemptions for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "coupon_redemptions_insert_own" on public.coupon_redemptions for insert with check (auth.uid() = user_id);
create policy "coupon_redemptions_admin_all" on public.coupon_redemptions for all using (public.has_role(auth.uid(), 'admin'));

create policy "competitions_public_read" on public.competitions for select using (is_active = true or public.has_role(auth.uid(), 'admin'));
create policy "competitions_admin_write" on public.competitions for all using (public.has_role(auth.uid(), 'admin'));

create policy "participants_select_own" on public.participants for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "participants_insert_any" on public.participants for insert with check (true);
create policy "participants_admin_all" on public.participants for all using (public.has_role(auth.uid(), 'admin'));

create policy "wheel_spins_select_own" on public.wheel_spins for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "wheel_spins_insert_auth" on public.wheel_spins for insert with check (auth.uid() = user_id);
create policy "wheel_spins_admin_all" on public.wheel_spins for all using (public.has_role(auth.uid(), 'admin'));

create policy "catalogues_public_read" on public.catalogues for select using (is_active = true or public.has_role(auth.uid(), 'admin'));
create policy "catalogues_admin_write" on public.catalogues for all using (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('promotion-images', 'promotion-images', true),
  ('catalogue-pdfs', 'catalogue-pdfs', true),
  ('catalogue-covers', 'catalogue-covers', true)
on conflict (id) do nothing;

create policy "public_read_product_images" on storage.objects for select using (bucket_id = 'product-images');
create policy "admin_write_product_images" on storage.objects for all using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "public_read_promotion_images" on storage.objects for select using (bucket_id = 'promotion-images');
create policy "admin_write_promotion_images" on storage.objects for all using (bucket_id = 'promotion-images' and public.has_role(auth.uid(), 'admin'));

create policy "public_read_catalogue_pdfs" on storage.objects for select using (bucket_id = 'catalogue-pdfs');
create policy "admin_write_catalogue_pdfs" on storage.objects for all using (bucket_id = 'catalogue-pdfs' and public.has_role(auth.uid(), 'admin'));

create policy "public_read_catalogue_covers" on storage.objects for select using (bucket_id = 'catalogue-covers');
create policy "admin_write_catalogue_covers" on storage.objects for all using (bucket_id = 'catalogue-covers' and public.has_role(auth.uid(), 'admin'));

-- Useful indexes
create index on public.products (category_id);
create index on public.products (is_featured) where is_featured = true;
create index on public.promotions (is_active, ends_at);
create index on public.coupons (is_active, expires_at);
create index on public.participants (competition_id);
create index on public.wheel_spins (user_id, spun_at desc);
