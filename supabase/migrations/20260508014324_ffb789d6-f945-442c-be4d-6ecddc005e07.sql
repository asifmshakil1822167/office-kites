
-- Fix set_updated_at search_path
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- Replace permissive policies with explicit auth checks
do $$
declare t text;
begin
  for t in select unnest(array['employees','attendance','products','transactions']) loop
    execute format('drop policy if exists "Authenticated read %1$s" on public.%1$s', t);
    execute format('drop policy if exists "Authenticated insert %1$s" on public.%1$s', t);
    execute format('drop policy if exists "Authenticated update %1$s" on public.%1$s', t);
    execute format('drop policy if exists "Authenticated delete %1$s" on public.%1$s', t);
    execute format('create policy "auth_select_%1$s" on public.%1$s for select to authenticated using (auth.uid() is not null)', t);
    execute format('create policy "auth_insert_%1$s" on public.%1$s for insert to authenticated with check (auth.uid() is not null)', t);
    execute format('create policy "auth_update_%1$s" on public.%1$s for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null)', t);
    execute format('create policy "auth_delete_%1$s" on public.%1$s for delete to authenticated using (auth.uid() is not null)', t);
  end loop;
end $$;
