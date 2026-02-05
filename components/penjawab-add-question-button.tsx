"use client";

import { useRouter } from "next/navigation";
import { QuestionForm } from "./question-form";

export function PenjawabAddQuestionButton() {
  const router = useRouter();
  return (
    <QuestionForm
      mode="create"
      onSuccess={() => router.refresh()}
      triggerLabel="Tambah Pertanyaan Manual"
    />
  );
}
