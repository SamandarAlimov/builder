-- Create table for AI house designs
CREATE TABLE public.house_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  style TEXT,
  rooms_count INTEGER,
  floors_count INTEGER,
  color_scheme TEXT,
  building_type TEXT DEFAULT 'house',
  image_url TEXT,
  prompt_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.house_designs ENABLE ROW LEVEL SECURITY;

-- Users can view their own designs
CREATE POLICY "Users can view their own designs"
ON public.house_designs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own designs
CREATE POLICY "Users can create their own designs"
ON public.house_designs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own designs
CREATE POLICY "Users can update their own designs"
ON public.house_designs
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own designs
CREATE POLICY "Users can delete their own designs"
ON public.house_designs
FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_house_designs_updated_at
BEFORE UPDATE ON public.house_designs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();