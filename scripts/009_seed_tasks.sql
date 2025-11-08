-- Insert default tasks
INSERT INTO public.tasks (title, description, reward, task_type, icon, action_url) VALUES
  ('Follow on X', 'Follow Oblium on X (Twitter)', 100, 'social', '𝕏', 'https://twitter.com/obliumtoken'),
  ('Join Discord', 'Join our community Discord server', 150, 'social', '💬', 'https://discord.gg/oblium'),
  ('Share Referral', 'Share your referral link with 3 friends', 200, 'referral', '🔗', NULL),
  ('Daily Check-in', 'Check in daily for bonus points', 50, 'daily', '⭐', NULL),
  ('Ambassador Mission', 'Complete special ambassador tasks', 500, 'special', '🚀', NULL),
  ('Share on Telegram', 'Share Oblium in Telegram groups', 120, 'social', '📱', 'https://t.me/oblium')
ON CONFLICT DO NOTHING;
