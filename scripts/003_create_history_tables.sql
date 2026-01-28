-- Create question history table
CREATE TABLE IF NOT EXISTS question_history (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  divisi_instansi VARCHAR(255) NOT NULL,
  nama_pemohon VARCHAR(255) NOT NULL,
  unit_bisnis VARCHAR(255) NOT NULL,
  data_informasi TEXT NOT NULL,
  advisory_diinginkan TEXT NOT NULL,
  jenis_advisory TEXT[] NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create answer history table
CREATE TABLE IF NOT EXISTS answer_history (
  id SERIAL PRIMARY KEY,
  answer_id INTEGER NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  no_registrasi VARCHAR(100) NOT NULL,
  technical_advisory_note TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_question_history_question_id ON question_history(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_history_answer_id ON answer_history(answer_id);
