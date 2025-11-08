-- Add admin role to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create RLS policy for admin task management
DROP POLICY IF EXISTS tasks_admin_all ON public.tasks;
CREATE POLICY tasks_admin_all ON public.tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
