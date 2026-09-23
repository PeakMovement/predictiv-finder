-- Blank Lovable Cloud databases do not have this helper yet.
-- 20250724104141 and 20251115124455 create updated_at triggers that call it,
-- and those files sort first. On the linked project the function already
-- existed before those migrations ran. This file sorts before both.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
