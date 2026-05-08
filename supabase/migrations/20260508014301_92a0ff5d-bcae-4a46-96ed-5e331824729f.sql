
-- Roles enum and table
create type public.app_role as enum ('admin', 'manager', 'employee');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'employee',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view their own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  insert into public.user_roles (user_id, role) values (new.id, 'employee');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- Employees
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  department text not null,
  role text not null,
  salary numeric not null default 0,
  join_date date not null default current_date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.employees enable row level security;
create trigger employees_updated before update on public.employees for each row execute function public.set_updated_at();
create policy "Authenticated read employees" on public.employees for select to authenticated using (true);
create policy "Authenticated insert employees" on public.employees for insert to authenticated with check (true);
create policy "Authenticated update employees" on public.employees for update to authenticated using (true);
create policy "Authenticated delete employees" on public.employees for delete to authenticated using (true);

-- Attendance
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  date date not null,
  status text not null,
  created_at timestamptz not null default now()
);
alter table public.attendance enable row level security;
create policy "Authenticated read attendance" on public.attendance for select to authenticated using (true);
create policy "Authenticated insert attendance" on public.attendance for insert to authenticated with check (true);
create policy "Authenticated update attendance" on public.attendance for update to authenticated using (true);
create policy "Authenticated delete attendance" on public.attendance for delete to authenticated using (true);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null,
  category text not null,
  quantity integer not null default 0,
  price numeric not null default 0,
  low_stock_threshold integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create trigger products_updated before update on public.products for each row execute function public.set_updated_at();
create policy "Authenticated read products" on public.products for select to authenticated using (true);
create policy "Authenticated insert products" on public.products for insert to authenticated with check (true);
create policy "Authenticated update products" on public.products for update to authenticated using (true);
create policy "Authenticated delete products" on public.products for delete to authenticated using (true);

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  category text not null,
  amount numeric not null default 0,
  description text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now()
);
alter table public.transactions enable row level security;
create policy "Authenticated read transactions" on public.transactions for select to authenticated using (true);
create policy "Authenticated insert transactions" on public.transactions for insert to authenticated with check (true);
create policy "Authenticated update transactions" on public.transactions for update to authenticated using (true);
create policy "Authenticated delete transactions" on public.transactions for delete to authenticated using (true);
