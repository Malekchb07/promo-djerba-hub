
-- Storage policies: admins can write/delete; public already reads (buckets are public)
DO $$ BEGIN
  CREATE POLICY "admin_storage_insert" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id IN ('product-images','promotion-images','catalogue-pdfs','catalogue-covers')
      AND public.has_role(auth.uid(), 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin_storage_update" ON storage.objects FOR UPDATE TO authenticated
    USING (
      bucket_id IN ('product-images','promotion-images','catalogue-pdfs','catalogue-covers')
      AND public.has_role(auth.uid(), 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin_storage_delete" ON storage.objects FOR DELETE TO authenticated
    USING (
      bucket_id IN ('product-images','promotion-images','catalogue-pdfs','catalogue-covers')
      AND public.has_role(auth.uid(), 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
