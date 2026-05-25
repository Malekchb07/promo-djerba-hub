CREATE TABLE public.lottery_draws (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id uuid NOT NULL,
  participant_id uuid NOT NULL,
  drawn_by uuid,
  drawn_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_lottery_draws_competition ON public.lottery_draws(competition_id, drawn_at DESC);

ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lottery_draws_admin_all"
ON public.lottery_draws
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "lottery_draws_select_own"
ON public.lottery_draws
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.participants p
  WHERE p.id = lottery_draws.participant_id AND p.user_id = auth.uid()
));