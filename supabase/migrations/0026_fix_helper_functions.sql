-- ==========================================
-- FIX HELPER FUNCTIONS (0026_fix_helper_functions.sql)
-- ==========================================

DROP FUNCTION IF EXISTS auth.user_role() CASCADE;
DROP FUNCTION IF EXISTS public.user_role() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_farm_id() CASCADE;

CREATE OR REPLACE FUNCTION public.current_user_role() RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.current_user_farm_id() RETURNS uuid AS $$
  SELECT id FROM public.farms WHERE owner_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_farm_id() TO authenticated, anon, service_role;
