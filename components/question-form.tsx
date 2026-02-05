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
import { Plate, usePlateEditor } from "platejs/react";
import { Editor, EditorContainer } from "./ui/editor";

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

    try {
      // Client-side validation
      const divisi_instansi = formData.get("divisi_instansi") as string;
      const nama_pemohon = formData.get("nama_pemohon") as string;
      const unit_bisnis = formData.get("unit_bisnis") as string;
      const advisory_diinginkan = formData.get("advisory_diinginkan") as string;

      // Validasi field text
      if (!divisi_instansi?.trim()) {
        setError("Divisi/Instansi Pemohon harus diisi");
        setIsLoading(false);
        return;
      }
      if (!nama_pemohon?.trim()) {
        setError("Nama Pemohon harus diisi");
        setIsLoading(false);
        return;
      }
      if (!unit_bisnis?.trim()) {
        setError("Unit Bisnis/Proyek/Anak Usaha harus diisi");
        setIsLoading(false);
        return;
      }
      if (!advisory_diinginkan?.trim()) {
        setError("Advisory Yang Diinginkan harus diisi");
        setIsLoading(false);
        return;
      }

      // Get data from Plate editor
      const editorValue = editor?.api?.getSerializedValue();
      let editorContent = "";

      if (editorValue && Array.isArray(editorValue)) {
        // Extract text from editor blocks
        editorContent = editorValue
          .map((block: any) => {
            if (block.children && Array.isArray(block.children)) {
              return block.children
                .map((child: any) => child.text || "")
                .join("");
            }
            return "";
          })
          .filter((text: string) => text.trim())
          .join("\n");
      } else if (editorValue && typeof editorValue === "object") {
        editorContent = JSON.stringify(editorValue);
      }

      if (!editorContent?.trim()) {
        setError("Data/Informasi Yang Diberikan harus diisi");
        setIsLoading(false);
        return;
      }

      // Set editor content to hidden field
      const hiddenInput = document.getElementById(
        "data_informasi_hidden"
      ) as HTMLInputElement;
      if (hiddenInput) {
        hiddenInput.value = editorContent;
      }
      formData.set("data_informasi", editorContent);

      // Validasi advisory types
      if (selectedTypes.length === 0) {
        setError("Pilih minimal 1 jenis advisory");
        setIsLoading(false);
        return;
      }

      // Add selected advisory types
      selectedTypes.forEach((type) => {
        formData.append("jenis_advisory", type);
      });

      console.log("[v0] Form validation passed, submitting...");
      console.log("[v0] Editor content:", editorContent);

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
    } catch (err) {
      console.error("[v0] Form submission error:", err);
      setError("Terjadi kesalahan saat mengirim form");
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

  const editor = usePlateEditor();

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

          {/* Hidden field untuk menyimpan data dari rich text editor */}
          <input
            type="hidden"
            name="data_informasi"
            id="data_informasi_hidden"
            value=""
          />

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
                    minLength={1}
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
                    minLength={1}
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
                  minLength={1}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="data_informasi_editor">
                  Data/Informasi Yang Diberikan
                </Label>
                <Plate editor={editor}>
                  <EditorContainer>
                    <Editor
                      id="data_informasi_editor"
                      defaultValue={question?.data_informasi ? JSON.parse(question.data_informasi) : undefined}
                      placeholder="Jelaskan data/informasi yang diberikan..."
                      rows={5}
                    />
                  </EditorContainer>
                </Plate>
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
                  minLength={1}
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
