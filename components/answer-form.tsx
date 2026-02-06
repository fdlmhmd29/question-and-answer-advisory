"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  submitAnswer,
  generateRegistrationNumber,
} from "@/app/actions/questions";
import { ADVISORY_TYPES } from "@/lib/types";
import type { QuestionWithAnswer } from "@/lib/types";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/components/toast-notification";

interface AnswerFormProps {
  question: QuestionWithAnswer;
  onSuccess?: () => void;
}

export function AnswerForm({ question, onSuccess }: AnswerFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAdvisoryType, setSelectedAdvisoryType] = useState<string>(
    question.jenis_advisory[0] || "",
  );
  const [registrationNumber, setRegistrationNumber] = useState<string>("");
  const [technicalNote, setTechnicalNote] = useState<string>("");

  useEffect(() => {
    async function fetchRegNumber() {
      if (selectedAdvisoryType) {
        const regNum = await generateRegistrationNumber(
          question.id,
          selectedAdvisoryType,
        );
        setRegistrationNumber(regNum);
      }
    }
    fetchRegNumber();
  }, [question.id, selectedAdvisoryType]);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    formData.set("no_registrasi", registrationNumber);
    formData.set("technical_advisory_note", technicalNote);

    try {
      const result = await submitAnswer(question.id, formData);

      if (result?.error) {
        setError(result.error);
        toast({
          type: 'error',
          title: 'Gagal Mengirim Jawaban',
          message: result.error,
        });
      } else {
        toast({
          type: 'success',
          title: 'Jawaban Berhasil Dikirim',
          message: 'Jawaban Anda telah disimpan dan dikirim ke sistem.',
        });
        router.refresh();
        setTechnicalNote('');
        onSuccess?.();
      }
    } catch (error) {
      const errorMessage = 'Terjadi kesalahan saat mengirim jawaban';
      setError(errorMessage);
      toast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-primary">Berikan Jawaban</h3>

      <form action={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label>No. Registrasi</Label>
          <Input
            value={registrationNumber}
            disabled
            className="bg-muted font-mono"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="technical_advisory_note" className="italic">
            Technical Advisory Note:
          </Label>
          <RichTextEditor
            value={technicalNote}
            onChange={setTechnicalNote}
            placeholder="Tulis technical advisory note di sini..."
            editorClassName="[&_.ProseMirror]:min-h-[200px]"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || !registrationNumber}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Kirim Jawaban
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
