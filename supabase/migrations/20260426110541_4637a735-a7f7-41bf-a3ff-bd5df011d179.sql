
-- Create public storage bucket for crop images
INSERT INTO storage.buckets (id, name, public) VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Crop images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'crop-images');

-- Authenticated users upload to their own folder
CREATE POLICY "Users upload own crop images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users update/delete their own crop images
CREATE POLICY "Users update own crop images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own crop images"
ON storage.objects FOR DELETE
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow sellers to UPDATE their own listings (already exists per RLS) — also needed for edit flow
-- (No-op: policy "Sellers update own listings" already exists)
