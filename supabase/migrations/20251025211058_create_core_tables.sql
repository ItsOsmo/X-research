-- Create Core Research Platform Tables
-- 
-- 1. New Tables
--    - studies: Main study information
--    - users: User profiles
--    - participants: Study participation records
--    - forms: Data collection forms
--    - responses: Form responses
--
-- 2. Security
--    - Enable RLS on all tables
--    - Researchers can only access their own studies
--    - Participants can only access studies they're enrolled in
--
-- 3. Indexes for performance

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text,
  role text NOT NULL CHECK (role IN ('researcher', 'participant')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_auth_id_idx ON users(auth_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Create studies table
CREATE TABLE IF NOT EXISTS studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text,
  category text,
  compensation numeric DEFAULT 0,
  duration integer,
  location text DEFAULT 'remote',
  participants_needed integer,
  deadline text,
  requirements jsonb DEFAULT '[]'::jsonb,
  screening_questions jsonb DEFAULT '[]'::jsonb,
  auto_approve boolean DEFAULT false,
  payment_schedule text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studies_researcher_id_idx ON studies(researcher_id);
CREATE INDEX IF NOT EXISTS studies_status_idx ON studies(status);
CREATE INDEX IF NOT EXISTS studies_created_at_idx ON studies(created_at);

ALTER TABLE studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can view their own studies"
  ON studies FOR SELECT
  TO authenticated
  USING (auth.uid() = researcher_id);

CREATE POLICY "Anyone can view active studies"
  ON studies FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Researchers can create studies"
  ON studies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = researcher_id);

CREATE POLICY "Researchers can update their own studies"
  ON studies FOR UPDATE
  TO authenticated
  USING (auth.uid() = researcher_id)
  WITH CHECK (auth.uid() = researcher_id);

CREATE POLICY "Researchers can delete their own studies"
  ON studies FOR DELETE
  TO authenticated
  USING (auth.uid() = researcher_id);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid REFERENCES studies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  payout_amount numeric,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS participants_study_id_idx ON participants(study_id);
CREATE INDEX IF NOT EXISTS participants_user_id_idx ON participants(user_id);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can view participants in their studies"
  ON participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM studies
      WHERE studies.id = participants.study_id
      AND studies.researcher_id = auth.uid()
    )
  );

CREATE POLICY "Participants can view their own participation"
  ON participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = participants.user_id
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create participation records"
  ON participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_id
      AND users.auth_id = auth.uid()
    )
  );

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid REFERENCES studies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS forms_study_id_idx ON forms(study_id);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can manage forms for their studies"
  ON forms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM studies
      WHERE studies.id = forms.study_id
      AND studies.researcher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM studies
      WHERE studies.id = forms.study_id
      AND studies.researcher_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view forms for active studies"
  ON forms FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM studies
      WHERE studies.id = forms.study_id
      AND studies.status = 'active'
    )
  );

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  response_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS responses_form_id_idx ON responses(form_id);
CREATE INDEX IF NOT EXISTS responses_participant_id_idx ON responses(participant_id);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can view responses for their studies"
  ON responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms
      JOIN studies ON studies.id = forms.study_id
      WHERE forms.id = responses.form_id
      AND studies.researcher_id = auth.uid()
    )
  );

CREATE POLICY "Participants can create responses"
  ON responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      JOIN users ON users.id = participants.user_id
      WHERE participants.id = participant_id
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Participants can view their own responses"
  ON responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      JOIN users ON users.id = participants.user_id
      WHERE participants.id = responses.participant_id
      AND users.auth_id = auth.uid()
    )
  );