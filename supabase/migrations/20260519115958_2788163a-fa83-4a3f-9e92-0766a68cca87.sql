
-- Fix search_path on remaining functions
alter function public.set_updated_at() set search_path = public;
alter function public.handle_new_user() set search_path = public;

-- Revoke broad EXECUTE on SECURITY DEFINER helpers (still callable internally by RLS policies)
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.set_updated_at() from anon, authenticated, public;

-- Tighten participant inserts: require authenticated user OR a competition row to be active
drop policy if exists "participants_insert_any" on public.participants;
create policy "participants_insert_authenticated" on public.participants
  for insert to authenticated
  with check (
    exists (select 1 from public.competitions c where c.id = competition_id and c.is_active = true)
  );
