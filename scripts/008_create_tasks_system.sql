-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward INTEGER NOT NULL,
  task_type TEXT NOT NULL, -- 'social', 'referral', 'daily', 'special'
  icon TEXT NOT NULL,
  action_url TEXT, -- Optional external link for task completion
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_completions table
CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  points_awarded INTEGER NOT NULL,
  UNIQUE(user_id, task_id) -- Prevent duplicate completions
);

-- RLS Policies for tasks (public read)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tasks_select_all ON public.tasks;
CREATE POLICY tasks_select_all ON public.tasks
  FOR SELECT
  USING (active = true);

-- RLS Policies for task_completions (users can only see and insert their own)
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS task_completions_select_own ON public.task_completions;
CREATE POLICY task_completions_select_own ON public.task_completions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS task_completions_insert_own ON public.task_completions;
CREATE POLICY task_completions_insert_own ON public.task_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_completions_user ON public.task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_task ON public.task_completions(task_id);
