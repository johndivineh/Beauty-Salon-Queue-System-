-- Migration to fix the 'tickets' table schema
-- This adds missing columns required by the application logic

-- 1. Fix 'tickets' table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Madina',
ADD COLUMN IF NOT EXISTS queue_number TEXT,
ADD COLUMN IF NOT EXISTS bringing_own_extensions BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS check_in_code TEXT,
ADD COLUMN IF NOT EXISTS deferral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS est_minutes INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS is_ready BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stylist_id UUID REFERENCES public.braiders(id),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT,
ADD COLUMN IF NOT EXISTS delete_reason TEXT,
ADD COLUMN IF NOT EXISTS deleted_from_status TEXT,
ADD COLUMN IF NOT EXISTS delete_action_type TEXT,
ADD COLUMN IF NOT EXISTS called_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS service_start_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS service_end_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rating NUMERIC,
ADD COLUMN IF NOT EXISTS selected_extensions TEXT[];

-- Ensure column names are consistent (using snake_case for DB)
-- If 'name' exists but 'customer_name' is expected by some code, we'll stick to one.
-- The code currently handles both via fallbacks, but let's standardize.

-- 2. Fix 'inspo_styles' table (if needed)
-- Assuming it might be missing some fields
ALTER TABLE public.inspo_styles
ADD COLUMN IF NOT EXISTS recommended_extensions TEXT,
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trending BOOLEAN DEFAULT false;

-- 3. Fix RLS Policies for Admin Deletion
-- Enable RLS on all tables
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspo_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.braiders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (Allowing all for now to ensure functionality)
-- In a real production app, you would restrict these to authenticated admins.

-- inspo_styles
DROP POLICY IF EXISTS "Manage styles" ON public.inspo_styles;
CREATE POLICY "Manage styles" ON public.inspo_styles FOR ALL USING (true);

-- braiders
DROP POLICY IF EXISTS "Manage braiders" ON public.braiders;
CREATE POLICY "Manage braiders" ON public.braiders FOR ALL USING (true);

-- inventory_items
DROP POLICY IF EXISTS "Manage inventory" ON public.inventory_items;
CREATE POLICY "Manage inventory" ON public.inventory_items FOR ALL USING (true);

-- tickets
DROP POLICY IF EXISTS "Manage tickets" ON public.tickets;
CREATE POLICY "Manage tickets" ON public.tickets FOR ALL USING (true);

-- audit_logs
DROP POLICY IF EXISTS "Manage audit" ON public.audit_logs;
CREATE POLICY "Manage audit" ON public.audit_logs FOR ALL USING (true);

-- service_logs
DROP POLICY IF EXISTS "Manage logs" ON public.service_logs;
CREATE POLICY "Manage logs" ON public.service_logs FOR ALL USING (true);
