
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'buyer' check (role in ('buyer','seller')),
  location text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles viewable by all" on public.profiles for select using (true);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  price_per_kg numeric(10,2) not null,
  min_order_kg integer not null default 1,
  stock_kg integer not null default 0,
  location text,
  distance_km integer,
  status text not null default 'in_stock' check (status in ('in_stock','harvesting_soon','out_of_stock')),
  image_url text,
  rating numeric(2,1) default 4.5,
  views integer default 0,
  created_at timestamptz not null default now()
);
alter table public.listings enable row level security;
create policy "Listings viewable by all" on public.listings for select using (true);
create policy "Sellers insert own listings" on public.listings for insert with check (auth.uid() = seller_id);
create policy "Sellers update own listings" on public.listings for update using (auth.uid() = seller_id);
create policy "Sellers delete own listings" on public.listings for delete using (auth.uid() = seller_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references auth.users(id) on delete cascade not null,
  total_amount numeric(10,2) not null,
  status text not null default 'processing' check (status in ('processing','completed','cancelled')),
  delivery_name text,
  delivery_phone text,
  delivery_address text,
  payment_method text,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete set null,
  title text not null,
  quantity_kg integer not null,
  price_per_kg numeric(10,2) not null,
  subtotal numeric(10,2) not null
);
alter table public.order_items enable row level security;

create policy "Buyers view own orders" on public.orders for select using (auth.uid() = buyer_id);
create policy "Sellers view orders w/ their listings" on public.orders for select using (
  exists (select 1 from public.order_items oi join public.listings l on l.id = oi.listing_id
          where oi.order_id = orders.id and l.seller_id = auth.uid())
);
create policy "Buyers create orders" on public.orders for insert with check (auth.uid() = buyer_id);

create policy "Buyers view own order items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
);
create policy "Sellers view items of their listings" on public.order_items for select using (
  exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
);
create policy "Buyers create order items" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name',''),
          coalesce(new.raw_user_meta_data->>'phone',''),
          coalesce(new.raw_user_meta_data->>'role','buyer'));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

insert into public.listings (title, description, category, price_per_kg, min_order_kg, stock_kg, location, distance_km, status, image_url, rating) values
('Premium Sharbati Wheat','High quality, organically grown Sharbati wheat directly from farms.','grains',32,50,500,'Ludhiana, Punjab',12,'in_stock','https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800',4.8),
('Organic Red Tomatoes','Farm fresh, pesticide-free tomatoes perfect for daily use.','vegetables',45,20,300,'Nashik, Maharashtra',45,'in_stock','https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',4.9),
('Long Grain Basmati','Aged premium basmati rice with authentic aroma. Pre-booking open.','grains',110,100,0,'Karnal, Haryana',80,'harvesting_soon','https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',4.7),
('Organic Green Peas','Sweet and tender green peas, hand-picked at peak freshness.','vegetables',85,10,150,'Shimla, Himachal',60,'in_stock','https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=800',4.6),
('Alphonso Mangoes','King of mangoes — Ratnagiri farms, GI-tagged, sweet and aromatic.','fruits',380,5,80,'Ratnagiri, Maharashtra',120,'in_stock','https://images.unsplash.com/photo-1605027990121-cbae9e0642db?w=800',4.9),
('Yellow Lentils (Toor Dal)','Unpolished, chemical-free toor dal directly from MP farmers.','grains',140,25,220,'Indore, Madhya Pradesh',95,'in_stock','https://images.unsplash.com/photo-1599909533730-c0bbb1d83b59?w=800',4.7);
