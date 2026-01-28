import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)

export type User = {
  id: number
  email: string
  password_hash: string
  name: string
  role: 'penanya' | 'penjawab'
  created_at: Date
  updated_at: Date
}

export type Session = {
  id: number
  user_id: number
  session_token: string
  expires_at: Date
  created_at: Date
}

export type Question = {
  id: number
  user_id: number
  divisi_instansi: string
  nama_pemohon: string
  unit_bisnis: string
  tanggal_permohonan: Date
  data_informasi: string
  advisory_diinginkan: string
  jenis_advisory: string[]
  status: 'belum_dijawab' | 'dijawab'
  created_at: Date
  updated_at: Date
}

export type Answer = {
  id: number
  question_id: number
  user_id: number
  tanggal_jawaban: Date
  no_registrasi: string
  technical_advisory_note: string
  created_at: Date
  updated_at: Date
}

export type QuestionWithAnswer = Question & {
  answer?: Answer
}
