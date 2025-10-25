-- Create form responses table
--
-- 1. New Tables
--    - form_responses: Public form submission responses
--
-- 2. Security
--    - Enable RLS on form_responses table
--    - Researchers can view responses from their studies
--    - Anyone can submit responses (public forms)
--
-- 3. Indexes
--    - Index on study_id for faster lookups
--    - Index on submitted_at for chronological queries
--    - Index on participant_email for participant tracking

CREATE TABLE IF NOT EXISTS form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid REFERENCES studies(id) ON DELETE CASCADE NOT NULL,
  participant_email text NOT NULL,
  participant_name text,
  response_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz DEFAULT now(),
  ip_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS form_responses_study_id_idx ON form_responses(study_id);
CREATE INDEX IF NOT EXISTS form_responses_submitted_at_idx ON form_responses(submitted_at);
CREATE INDEX IF NOT EXISTS form_responses_participant_email_idx ON form_responses(participant_email);

ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can view responses from their studies"
  ON form_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM studies
      WHERE studies.id = form_responses.study_id
      AND studies.researcher_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can submit form responses"
  ON form_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Researchers cannot update responses"
  ON form_responses FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Researchers cannot delete responses"
  ON form_responses FOR DELETE
  TO authenticated
  USING (false);