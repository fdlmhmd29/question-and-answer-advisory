import { neon } from "@neondatabase/serverless";
import type { Question, QuestionWithAnswer, QuestionFilter, Answer, QuestionHistory, AnswerHistory } from "./types";

const sql = neon(process.env.DATABASE_URL!);

const ITEMS_PER_PAGE = 5;

// Save question edit history
async function saveQuestionHistory(
  questionId: string,
  userId: string,
  fieldChanged: string,
  oldValue: string,
  newValue: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO question_history (question_id, user_id, field_changed, old_value, new_value)
      VALUES (${questionId}, ${userId}, ${fieldChanged}, ${oldValue}, ${newValue})
    `;
  } catch (error) {
    console.error("Save question history error:", error);
  }
}

// Save answer edit history
async function saveAnswerHistory(
  answerId: string,
  userId: string,
  oldNote: string,
  newNote: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO answer_history (answer_id, user_id, old_note, new_note)
      VALUES (${answerId}, ${userId}, ${oldNote}, ${newNote})
    `;
  } catch (error) {
    console.error("Save answer history error:", error);
  }
}

export async function createQuestion(
  userId: string,
  data: {
    divisi_instansi: string;
    nama_pemohon: string;
    unit_bisnis: string;
    data_informasi: string;
    advisory_diinginkan: string;
    jenis_advisory: string[];
  }
): Promise<{ success: boolean; error?: string; question?: Question }> {
  try {
    // Convert array to PostgreSQL array format
    const pgArray = `{${data.jenis_advisory.map(s => `"${s}"`).join(",")}}`;
    
    const result = await sql`
      INSERT INTO questions (
        user_id, divisi_instansi, nama_pemohon, unit_bisnis,
        data_informasi, advisory_diinginkan, jenis_advisory
      )
      VALUES (
        ${userId}, ${data.divisi_instansi}, ${data.nama_pemohon}, 
        ${data.unit_bisnis}, ${data.data_informasi}, 
        ${data.advisory_diinginkan}, ${pgArray}
      )
      RETURNING *
    `;

    return { success: true, question: result[0] as Question };
  } catch (error) {
    console.error("Create question error:", error);
    return { success: false, error: "Gagal membuat pertanyaan" };
  }
}

export async function updateQuestion(
  questionId: string,
  userId: string,
  data: {
    divisi_instansi: string;
    nama_pemohon: string;
    unit_bisnis: string;
    data_informasi: string;
    advisory_diinginkan: string;
    jenis_advisory: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get old question data for history
    const oldQuestion = await sql`
      SELECT * FROM questions WHERE id = ${questionId} AND user_id = ${userId} AND status = 'belum_dijawab'
    `;
    
    if (oldQuestion.length === 0) {
      return { success: false, error: "Pertanyaan tidak ditemukan atau sudah dijawab" };
    }
    
    const old = oldQuestion[0];
    
    // Convert array to PostgreSQL array format
    const pgArray = `{${data.jenis_advisory.map(s => `"${s}"`).join(",")}}`;
    
    // Update question
    await sql`
      UPDATE questions SET
        divisi_instansi = ${data.divisi_instansi},
        nama_pemohon = ${data.nama_pemohon},
        unit_bisnis = ${data.unit_bisnis},
        data_informasi = ${data.data_informasi},
        advisory_diinginkan = ${data.advisory_diinginkan},
        jenis_advisory = ${pgArray},
        updated_at = NOW()
      WHERE id = ${questionId}
    `;
    
    // Save history for changed fields
    if (old.divisi_instansi !== data.divisi_instansi) {
      await saveQuestionHistory(questionId, userId, "divisi_instansi", old.divisi_instansi, data.divisi_instansi);
    }
    if (old.nama_pemohon !== data.nama_pemohon) {
      await saveQuestionHistory(questionId, userId, "nama_pemohon", old.nama_pemohon, data.nama_pemohon);
    }
    if (old.unit_bisnis !== data.unit_bisnis) {
      await saveQuestionHistory(questionId, userId, "unit_bisnis", old.unit_bisnis, data.unit_bisnis);
    }
    if (old.data_informasi !== data.data_informasi) {
      await saveQuestionHistory(questionId, userId, "data_informasi", old.data_informasi, data.data_informasi);
    }
    if (old.advisory_diinginkan !== data.advisory_diinginkan) {
      await saveQuestionHistory(questionId, userId, "advisory_diinginkan", old.advisory_diinginkan, data.advisory_diinginkan);
    }

    return { success: true };
  } catch (error) {
    console.error("Update question error:", error);
    return { success: false, error: "Gagal mengupdate pertanyaan" };
  }
}

export async function deleteQuestion(
  questionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sql`
      DELETE FROM questions 
      WHERE id = ${questionId} AND user_id = ${userId} AND status = 'belum_dijawab'
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: "Pertanyaan tidak ditemukan atau sudah dijawab" };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete question error:", error);
    return { success: false, error: "Gagal menghapus pertanyaan" };
  }
}

export async function getQuestions(
  userId: string,
  role: "penanya" | "penjawab",
  filter: QuestionFilter
): Promise<{ questions: QuestionWithAnswer[]; totalPages: number; totalCount: number }> {
  try {
    const page = filter.page || 1;
    const offset = (page - 1) * ITEMS_PER_PAGE;
    
    // Build conditions
    let whereClause = role === "penanya" ? `q.user_id = '${userId}'` : "1=1";
    
    if (filter.status && filter.status !== "all") {
      whereClause += ` AND q.status = '${filter.status}'`;
    }
    
    if (filter.search) {
      const searchTerm = filter.search.replace(/'/g, "''");
      whereClause += ` AND (
        q.divisi_instansi ILIKE '%${searchTerm}%' OR 
        q.nama_pemohon ILIKE '%${searchTerm}%' OR 
        q.unit_bisnis ILIKE '%${searchTerm}%' OR
        q.data_informasi ILIKE '%${searchTerm}%'
      )`;
    }
    
    if (filter.dateFrom) {
      whereClause += ` AND q.tanggal_permohonan >= '${filter.dateFrom}'`;
    }
    
    if (filter.dateTo) {
      whereClause += ` AND q.tanggal_permohonan <= '${filter.dateTo}'`;
    }
    
    const orderBy = filter.sortBy === "oldest" ? "ASC" : "DESC";
    
    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as count FROM questions q WHERE ${sql.unsafe(whereClause)}
    `;
    const totalCount = parseInt(countResult[0].count);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    
    // Get questions with answers
    const questions = await sql`
      SELECT 
        q.*,
        a.id as answer_id,
        a.no_registrasi,
        a.tanggal_jawaban,
        a.technical_advisory_note,
        a.created_at as answer_created_at,
        u.name as answerer_name
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY q.tanggal_permohonan ${sql.unsafe(orderBy)}
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    
    const result: QuestionWithAnswer[] = questions.map((q) => ({
      id: q.id,
      user_id: q.user_id,
      divisi_instansi: q.divisi_instansi,
      nama_pemohon: q.nama_pemohon,
      unit_bisnis: q.unit_bisnis,
      tanggal_permohonan: new Date(q.tanggal_permohonan),
      data_informasi: q.data_informasi,
      advisory_diinginkan: q.advisory_diinginkan,
      jenis_advisory: typeof q.jenis_advisory === 'string' 
        ? JSON.parse(q.jenis_advisory) 
        : q.jenis_advisory,
      status: q.status,
      created_at: new Date(q.created_at),
      updated_at: new Date(q.updated_at),
      answer: q.answer_id ? {
        id: q.answer_id,
        question_id: q.id,
        answerer_id: "",
        no_registrasi: q.no_registrasi,
        tanggal_jawaban: new Date(q.tanggal_jawaban),
        technical_advisory_note: q.technical_advisory_note,
        created_at: new Date(q.answer_created_at),
      } : undefined,
      answerer_name: q.answerer_name,
    }));
    
    return { questions: result, totalPages, totalCount };
  } catch (error) {
    console.error("Get questions error:", error);
    return { questions: [], totalPages: 0, totalCount: 0 };
  }
}

export async function getQuestionById(
  questionId: string
): Promise<QuestionWithAnswer | null> {
  try {
    const result = await sql`
      SELECT 
        q.*,
        a.id as answer_id,
        a.no_registrasi,
        a.tanggal_jawaban,
        a.technical_advisory_note,
        a.created_at as answer_created_at,
        u.name as answerer_name
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE q.id = ${questionId}
    `;
    
    if (result.length === 0) return null;
    
    const q = result[0];
    return {
      id: q.id,
      user_id: q.user_id,
      divisi_instansi: q.divisi_instansi,
      nama_pemohon: q.nama_pemohon,
      unit_bisnis: q.unit_bisnis,
      tanggal_permohonan: new Date(q.tanggal_permohonan),
      data_informasi: q.data_informasi,
      advisory_diinginkan: q.advisory_diinginkan,
      jenis_advisory: typeof q.jenis_advisory === 'string' 
        ? JSON.parse(q.jenis_advisory) 
        : q.jenis_advisory,
      status: q.status,
      created_at: new Date(q.created_at),
      updated_at: new Date(q.updated_at),
      answer: q.answer_id ? {
        id: q.answer_id,
        question_id: q.id,
        answerer_id: "",
        no_registrasi: q.no_registrasi,
        tanggal_jawaban: new Date(q.tanggal_jawaban),
        technical_advisory_note: q.technical_advisory_note,
        created_at: new Date(q.answer_created_at),
      } : undefined,
      answerer_name: q.answerer_name,
    };
  } catch (error) {
    console.error("Get question error:", error);
    return null;
  }
}

export async function answerQuestion(
  questionId: string,
  answererId: string,
  data: {
    no_registrasi: string;
    technical_advisory_note: string;
  }
): Promise<{ success: boolean; error?: string; answer?: Answer }> {
  try {
    // Check if question exists and is not answered
    const question = await sql`
      SELECT id, status FROM questions WHERE id = ${questionId}
    `;
    
    if (question.length === 0) {
      return { success: false, error: "Pertanyaan tidak ditemukan" };
    }
    
    if (question[0].status === "dijawab") {
      return { success: false, error: "Pertanyaan sudah dijawab" };
    }
    
    // Create answer
    const result = await sql`
      INSERT INTO answers (question_id, user_id, no_registrasi, technical_advisory_note)
      VALUES (${questionId}, ${answererId}, ${data.no_registrasi}, ${data.technical_advisory_note})
      RETURNING *
    `;
    
    // Update question status
    await sql`
      UPDATE questions SET status = 'dijawab', updated_at = NOW()
      WHERE id = ${questionId}
    `;
    
    return { success: true, answer: result[0] as Answer };
  } catch (error) {
    console.error("Answer question error:", error);
    return { success: false, error: "Gagal menjawab pertanyaan" };
  }
}

export async function getNextRegistrationNumber(jenisAdvisory: string): Promise<string> {
  try {
    const year = new Date().getFullYear();
    
    // Count existing answers for this advisory type this year
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM answers 
      WHERE no_registrasi LIKE ${'%/' + jenisAdvisory + '/' + year}
    `;
    
    const count = parseInt(result[0].count) + 1;
    const paddedCount = count.toString().padStart(3, "0");
    
    return `${paddedCount}/${jenisAdvisory}/${year}`;
  } catch {
    const year = new Date().getFullYear();
    return `001/${jenisAdvisory}/${year}`;
  }
}

// Update answer (penjawab can edit their answer)
export async function updateAnswer(
  answerId: string,
  userId: string,
  data: {
    technical_advisory_note: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get old answer for history
    const oldAnswer = await sql`
      SELECT * FROM answers WHERE id = ${answerId}
    `;
    
    if (oldAnswer.length === 0) {
      return { success: false, error: "Jawaban tidak ditemukan" };
    }
    
    const old = oldAnswer[0];
    
    // Update answer
    await sql`
      UPDATE answers SET
        technical_advisory_note = ${data.technical_advisory_note},
        updated_at = NOW()
      WHERE id = ${answerId}
    `;
    
    // Save history if note changed
    if (old.technical_advisory_note !== data.technical_advisory_note) {
      await saveAnswerHistory(answerId, userId, old.technical_advisory_note, data.technical_advisory_note);
    }

    return { success: true };
  } catch (error) {
    console.error("Update answer error:", error);
    return { success: false, error: "Gagal mengupdate jawaban" };
  }
}

// Get question history
export async function getQuestionHistory(questionId: string): Promise<QuestionHistory[]> {
  try {
    const result = await sql`
      SELECT 
        qh.*,
        u.name as user_name
      FROM question_history qh
      LEFT JOIN users u ON qh.user_id = u.id
      WHERE qh.question_id = ${questionId}
      ORDER BY qh.created_at DESC
    `;
    
    return result.map((row) => ({
      id: row.id,
      question_id: row.question_id,
      user_id: row.user_id,
      user_name: row.user_name,
      field_changed: row.field_changed,
      old_value: row.old_value,
      new_value: row.new_value,
      created_at: new Date(row.created_at),
    }));
  } catch (error) {
    console.error("Get question history error:", error);
    return [];
  }
}

// Get answer history
export async function getAnswerHistory(answerId: string): Promise<AnswerHistory[]> {
  try {
    const result = await sql`
      SELECT 
        ah.*,
        u.name as user_name
      FROM answer_history ah
      LEFT JOIN users u ON ah.user_id = u.id
      WHERE ah.answer_id = ${answerId}
      ORDER BY ah.created_at DESC
    `;
    
    return result.map((row) => ({
      id: row.id,
      answer_id: row.answer_id,
      user_id: row.user_id,
      user_name: row.user_name,
      old_note: row.old_note,
      new_note: row.new_note,
      created_at: new Date(row.created_at),
    }));
  } catch (error) {
    console.error("Get answer history error:", error);
    return [];
  }
}
