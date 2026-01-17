-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'residential',
  image_url TEXT,
  location TEXT,
  year INTEGER,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public can view all projects
CREATE POLICY "Anyone can view projects"
ON public.projects
FOR SELECT
USING (true);

-- Only admins can manage projects
CREATE POLICY "Admins can insert projects"
ON public.projects
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects"
ON public.projects
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects"
ON public.projects
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample projects
INSERT INTO public.projects (title, description, category, location, year, featured, status) VALUES
('Tashkent City Tower', 'Zamonaviy 25 qavatli tijorat markazi', 'commercial', 'Toshkent', 2024, true, 'completed'),
('Green Villa Complex', 'Ekologik toza turar-joy majmuasi', 'residential', 'Samarqand', 2023, true, 'completed'),
('Industrial Park', 'Katta hajmli sanoat majmuasi', 'industrial', 'Buxoro', 2024, true, 'in_progress'),
('Modern Office Center', 'Zamonaviy ofis binosi', 'commercial', 'Toshkent', 2023, false, 'completed'),
('Family Houses', 'Oilaviy uylar loyihasi', 'residential', 'Farg''ona', 2024, false, 'in_progress');