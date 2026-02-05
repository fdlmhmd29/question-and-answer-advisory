"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { submitQuestion, editQuestion } from "@/app/actions/questions";
import { ADVISORY_TYPES } from "@/lib/types";
import type { Question } from "@/lib/types";
import { Loader2, Plus, Pencil } from "lucide-react";

interface QuestionFormProps {
  mode: "create" | "edit";
  question?: Question;
  onSuccess?: () => void;
  userName?: string;
  /** Untuk penjawab: label tombol buat pertanyaan manual */
  triggerLabel?: string;
}

export function QuestionForm({
  mode,
  question,
  onSuccess,
  userName,
  triggerLabel,
}: QuestionFormProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    question?.jenis_advisory || [],
  );

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    // Add selected advisory types
    selectedTypes.forEach((type) => {
      formData.append("jenis_advisory", type);
    });

    try {
      const result =
        mode === "create"
          ? await submitQuestion(formData)
          : await editQuestion(question!.id, formData);

      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setSelectedTypes([]);
        onSuccess?.();
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleAdvisoryType(typeId: string) {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId],
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {triggerLabel ?? "Tambah Pertanyaan Manual"}
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[50vw] max-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Pertanyaan Manual" : "Edit Pertanyaan"}
          </DialogTitle>
          <DialogDescription>
            Lengkapi form di bawah untuk{" "}
            {mode === "create"
              ? "mengajukan advisory"
              : "mengupdate pertanyaan"}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Layout landscape: dua kolom */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="divisi_instansi">
                    Divisi/Instansi Pemohon
                  </Label>
                  <Input
                    id="divisi_instansi"
                    name="divisi_instansi"
                    defaultValue={question?.divisi_instansi}
                    placeholder="Masukkan divisi/instansi"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nama_pemohon">Nama Pemohon</Label>
                  <Input
                    id="nama_pemohon"
                    name="nama_pemohon"
                    defaultValue={question?.nama_pemohon || userName}
                    placeholder="Masukkan nama pemohon"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="unit_bisnis">
                  Unit Bisnis/Proyek/Anak Usaha
                </Label>
                <Input
                  id="unit_bisnis"
                  name="unit_bisnis"
                  defaultValue={question?.unit_bisnis}
                  placeholder="Masukkan unit bisnis"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="data_informasi">
                  Data/Informasi Yang Diberikan
                </Label>
                <Textarea
                  id="data_informasi"
                  name="data_informasi"
                  defaultValue={question?.data_informasi}
                  placeholder="Jelaskan data/informasi yang diberikan..."
                  rows={5}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="advisory_diinginkan">
                  Advisory Yang Diinginkan
                </Label>
                <Textarea
                  id="advisory_diinginkan"
                  name="advisory_diinginkan"
                  defaultValue={question?.advisory_diinginkan}
                  placeholder="Jelaskan advisory yang diinginkan..."
                  rows={5}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Jenis Advisory (dapat memilih lebih dari 1)</Label>
              <div className="grid grid-cols-1 gap-2 p-4 border rounded-md max-h-[420px] overflow-y-auto">
                {ADVISORY_TYPES.map((type) => (
                  <div key={type.id} className="flex items-start gap-2">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={() => toggleAdvisoryType(type.id)}
                    />
                    <Label
                      htmlFor={`type-${type.id}`}
                      className="text-sm font-normal cursor-pointer leading-tight"
                    >
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedTypes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Pilih minimal 1 jenis advisory
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedTypes.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : mode === "create" ? (
                "Kirim Pertanyaan"
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
