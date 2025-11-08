-- Create function to safely increment user points
CREATE OR REPLACE FUNCTION increment_points(user_id UUID, points_to_add INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    points = COALESCE(points, 0) + points_to_add,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_points(UUID, INTEGER) TO authenticated;
