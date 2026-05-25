
-- 1) Participants: enforce auth.uid() = user_id on INSERT
DROP POLICY IF EXISTS participants_insert_authenticated ON public.participants;

-- Backfill: ensure no NULL user_id rows block the NOT NULL (skip if already clean)
-- ALTER TABLE public.participants ALTER COLUMN user_id SET NOT NULL; -- avoid if legacy NULLs

CREATE POLICY participants_insert_authenticated
ON public.participants
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.competitions c
    WHERE c.id = participants.competition_id AND c.is_active = true
  )
);

-- 2) Coupons: restrict SELECT to authenticated users (public listing handled server-side)
DROP POLICY IF EXISTS coupons_public_read ON public.coupons;

CREATE POLICY coupons_authenticated_read
ON public.coupons
FOR SELECT
TO authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Lock down trigger-only SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
