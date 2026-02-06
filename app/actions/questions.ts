"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  answerQuestion,
  getNextRegistrationNumber,
} from "@/lib/questions";

export async function submitQuestion(formData: FormData) {
  const session = await getSession();

  if (!session || (session.user.role !== "penanya" && session.user.role !== "penjawab")) {
    return { error: "Unauthorized" };
  }

  const divisi_instansi = formData.get("divisi_instansi") as string;
  const nama_pemohon = formData.get("nama_pemohon") as string;
  const unit_bisnis = formData.get("unit_bisnis") as string;
  const data_informasi = formData.get("data_informasi") as string;
  const advisory_diinginkan = formData.get("advisory_diinginkan") as string;
  const jenis_advisory = formData.getAll("jenis_advisory") as string[];

  if (
    !divisi_instansi ||
    !nama_pemohon ||
    !unit_bisnis ||
    !data_informasi ||
    !advisory_diinginkan ||
    jenis_advisory.length === 0
  ) {
    return { error: "Semua field harus diisi" };
  }

  const result = await createQuestion(session.user.id, {
    divisi_instansi,
    nama_pemohon,
    unit_bisnis,
    data_informasi,
    advisory_diinginkan,
    jenis_advisory,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/penanya", "max");
  revalidatePath("/dashboard/penjawab", "max");
  return { success: true };
}

export async function editQuestion(questionId: string, formData: FormData) {
  const session = await getSession();

  if (!session || session.user.role !== "penanya") {
    return { error: "Unauthorized" };
  }

  const divisi_instansi = formData.get("divisi_instansi") as string;
  const nama_pemohon = formData.get("nama_pemohon") as string;
  const unit_bisnis = formData.get("unit_bisnis") as string;
  const data_informasi = formData.get("data_informasi") as string;
  const advisory_diinginkan = formData.get("advisory_diinginkan") as string;
  const jenis_advisory = formData.getAll("jenis_advisory") as string[];

  if (
    !divisi_instansi ||
    !nama_pemohon ||
    !unit_bisnis ||
    !data_informasi ||
    !advisory_diinginkan ||
    jenis_advisory.length === 0
  ) {
    return { error: "Semua field harus diisi" };
  }

  const result = await updateQuestion(questionId, session.user.id, {
    divisi_instansi,
    nama_pemohon,
    unit_bisnis,
    data_informasi,
    advisory_diinginkan,
    jenis_advisory,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/penanya", "max");
  return { success: true };
}

export async function removeQuestion(questionId: string) {
  const session = await getSession();

  if (!session || session.user.role !== "penanya") {
    return { error: "Unauthorized" };
  }

  const result = await deleteQuestion(questionId, session.user.id);

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/penanya", "max");
  return { success: true };
}

export async function submitAnswer(questionId: string, formData: FormData) {
  const session = await getSession();

  if (!session || session.user.role !== "penjawab") {
    return { error: "Unauthorized" };
  }

  const no_registrasi = formData.get("no_registrasi") as string;
  const technical_advisory_note = formData.get("technical_advisory_note") as string;

  if (!no_registrasi || !technical_advisory_note) {
    return { error: "Semua field harus diisi" };
  }

  const result = await answerQuestion(questionId, session.user.id, {
    no_registrasi,
    technical_advisory_note,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/penjawab", "max");
  return { success: true };
}

export async function generateRegistrationNumber(questionId: string, jenisAdvisory: string) {
  return await getNextRegistrationNumber(questionId, jenisAdvisory);
}

export async function editAnswer(answerId: string, formData: FormData) {
  const session = await getSession();

  if (!session || session.user.role !== "penjawab") {
    return { error: "Unauthorized" };
  }

  const technical_advisory_note = formData.get("technical_advisory_note") as string;

  if (!technical_advisory_note) {
    return { error: "Catatan teknis tidak boleh kosong" };
  }

  const { updateAnswer } = await import("@/lib/questions");
  const result = await updateAnswer(answerId, session.user.id, {
    technical_advisory_note,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/penjawab", "max");
  return { success: true };
}
