/*
  # Create form responses table

  1. New Tables
    - `form_responses`
      - `id` (uuid, primary key) - Unique identifier for each response
      - `study_id` (uuid, foreign key) - References studies table
      - `participant_email` (text) - Email of the participant who filled the form
      - `participant_name` (text) - Name of the participant (optional)
      - `response_data` (jsonb) - JSON object containing all form field responses
      - `submitted_at` (timestamptz) - Timestamp when form was submitted
      - `ip_address` (text) - IP address of submitter (optional, for tracking)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `form_responses` table
    - Add policy for researchers to view responses from their own studies
    - Add policy for public users to submit responses (insert only)
    - No update or delete policies for data integrity

  3. Indexes
    - Index on study_id for faster lookups
    - Index on submitted_at for chronological queries
    - Index on participant_email for participant tracking

  4. Notes
    - response_data is JSONB to handle dynamic form structures
    - Each form can have different fields stored as key-value pairs
    - Researchers can only read responses, not modify them
*/

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