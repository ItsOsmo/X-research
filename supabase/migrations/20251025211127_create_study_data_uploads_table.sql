-- Create study data uploads table and storage
--
-- 1. New Tables
--    - study_data_uploads: File upload tracking
--
-- 2. Storage
--    - Create storage bucket for study data files
--
-- 3. Security
--    - Enable RLS on study_data_uploads table
--    - Storage policies to restrict access to study owners

CREATE TABLE IF NOT EXISTS study_data_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid REFERENCES studies(id) ON DELETE CASCADE NOT NULL,
  researcher_id uuid REFERENCES auth.users(id) NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  upload_date timestamptz DEFAULT now(),
  row_count integer,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS study_data_uploads_study_id_idx ON study_data_uploads(study_id);
CREATE INDEX IF NOT EXISTS study_data_uploads_researcher_id_idx ON study_data_uploads(researcher_id);

ALTER TABLE study_data_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can view their own study data uploads"
  ON study_data_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = researcher_id);

CREATE POLICY "Researchers can upload data to their own studies"
  ON study_data_uploads FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = researcher_id AND
    EXISTS (
      SELECT 1 FROM studies
      WHERE studies.id = study_id
      AND studies.researcher_id = auth.uid()
    )
  );

CREATE POLICY "Researchers can update their own study data uploads"
  ON study_data_uploads FOR UPDATE
  TO authenticated
  USING (auth.uid() = researcher_id)
  WITH CHECK (auth.uid() = researcher_id);

CREATE POLICY "Researchers can delete their own study data uploads"
  ON study_data_uploads FOR DELETE
  TO authenticated
  USING (auth.uid() = researcher_id);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-data', 'study-data', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Researchers can upload files to their studies"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'study-data' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM studies WHERE researcher_id = auth.uid()
    )
  );

CREATE POLICY "Researchers can view files from their studies"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'study-data' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM studies WHERE researcher_id = auth.uid()
    )
  );

CREATE POLICY "Researchers can update files from their studies"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'study-data' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM studies WHERE researcher_id = auth.uid()
    )
  );

CREATE POLICY "Researchers can delete files from their studies"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'study-data' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM studies WHERE researcher_id = auth.uid()
    )
  );