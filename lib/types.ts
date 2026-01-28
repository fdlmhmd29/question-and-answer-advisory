export const ADVISORY_TYPES = [
  { id: "01", label: "Penapisan/S.Arahan/PIL" },
  { id: "02", label: "KA ANDAL" },
  { id: "03", label: "ANDAL, RKL-RPL" },
  { id: "04", label: "Addendum ANDAL, RKL-RPL" },
  { id: "05", label: "UKL-UPL/DPLH/DELH/RKL Rinci" },
  { id: "06", label: "Pertek BMAL Sungai / BAP" },
  { id: "07", label: "Pertek BMAL Laut" },
  { id: "08", label: "Pertek / Clearance Emisi" },
  { id: "09", label: "Rintek LB3" },
  { id: "10", label: "Rintek Non B3" },
  { id: "11", label: "Andalalin" },
  { id: "12", label: "SLO (Air, Emisi, LB3)" },
  { id: "13", label: "Regulasi Lingkungan" },
  { id: "14", label: "Sharing Knowledge" },
  { id: "15", label: "Kemenhut (PPKH, RURH, R.DAS)" },
  { id: "16", label: "ESDM (RR, RPT)" },
  { id: "17", label: "Tata Ruang (KKPR, PKKPRL)" },
  { id: "18", label: "Amdalnet/SIMPEL" },
  { id: "19", label: "Lain - Lain" },
] as const;

export type AdvisoryTypeId = (typeof ADVISORY_TYPES)[number]["id"];

export type Question = {
  id: string;
  user_id: string;
  divisi_instansi: string;
  nama_pemohon: string;
  unit_bisnis: string;
  tanggal_permohonan: Date;
  data_informasi: string;
  advisory_diinginkan: string;
  jenis_advisory: string[];
  status: "belum_dijawab" | "dijawab";
  created_at: Date;
  updated_at: Date;
};

export type Answer = {
  id: string;
  question_id: string;
  answerer_id: string;
  no_registrasi: string;
  tanggal_jawaban: Date;
  technical_advisory_note: string;
  created_at: Date;
};

export type QuestionWithAnswer = Question & {
  answer?: Answer;
  answerer_name?: string;
};

export type QuestionFilter = {
  status?: "all" | "belum_dijawab" | "dijawab";
  sortBy?: "newest" | "oldest";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
};

export type QuestionHistory = {
  id: string;
  question_id: string;
  user_id: string;
  user_name?: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  created_at: Date;
};

export type AnswerHistory = {
  id: string;
  answer_id: string;
  user_id: string;
  user_name?: string;
  old_note: string;
  new_note: string;
  created_at: Date;
};
