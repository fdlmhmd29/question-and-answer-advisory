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

  const divisi_instansi = (formData.get("divisi_instansi") as string)?.trim();
  const nama_pemohon = (formData.get("nama_pemohon") as string)?.trim();
  const unit_bisnis = (formData.get("unit_bisnis") as string)?.trim();
  const data_informasi = (formData.get("data_informasi") as string)?.trim();
  const advisory_diinginkan = (formData.get("advisory_diinginkan") as string)?.trim();
  const jenis_advisory = formData.getAll("jenis_advisory") as string[];

  // Validasi dengan pesan spesifik
  if (!divisi_instansi) {
    return { error: "Divisi/Instansi Pemohon harus diisi" };
  }
  if (!nama_pemohon) {
    return { error: "Nama Pemohon harus diisi" };
  }
  if (!unit_bisnis) {
    return { error: "Unit Bisnis/Proyek/Anak Usaha harus diisi" };
  }
  if (!data_informasi) {
    return { error: "Data/Informasi Yang Diberikan harus diisi" };
  }
  if (!advisory_diinginkan) {
    return { error: "Advisory Yang Diinginkan harus diisi" };
  }
  if (jenis_advisory.length === 0) {
    return { error: "Pilih minimal 1 jenis advisory" };
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

  const divisi_instansi = (formData.get("divisi_instansi") as string)?.trim();
  const nama_pemohon = (formData.get("nama_pemohon") as string)?.trim();
  const unit_bisnis = (formData.get("unit_bisnis") as string)?.trim();
  const data_informasi = (formData.get("data_informasi") as string)?.trim();
  const advisory_diinginkan = (formData.get("advisory_diinginkan") as string)?.trim();
  const jenis_advisory = formData.getAll("jenis_advisory") as string[];

  // Validasi dengan pesan spesifik
  if (!divisi_instansi) {
    return { error: "Divisi/Instansi Pemohon harus diisi" };
  }
  if (!nama_pemohon) {
    return { error: "Nama Pemohon harus diisi" };
  }
  if (!unit_bisnis) {
    return { error: "Unit Bisnis/Proyek/Anak Usaha harus diisi" };
  }
  if (!data_informasi) {
    return { error: "Data/Informasi Yang Diberikan harus diisi" };
  }
  if (!advisory_diinginkan) {
    return { error: "Advisory Yang Diinginkan harus diisi" };
  }
  if (jenis_advisory.length === 0) {
    return { error: "Pilih minimal 1 jenis advisory" };
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
