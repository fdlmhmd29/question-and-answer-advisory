"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AnswerForm } from "./answer-form";
import { ADVISORY_TYPES } from "@/lib/types";
import type { QuestionWithAnswer } from "@/lib/types";
import { Eye, Calendar, Building, User, FileText } from "lucide-react";

interface QuestionDetailProps {
  question: QuestionWithAnswer;
  userRole: "penanya" | "penjawab";
}

export function QuestionDetail({ question, userRole }: QuestionDetailProps) {
  const [open, setOpen] = useState(false);

  function getAdvisoryLabel(id: string) {
    return ADVISORY_TYPES.find((t) => t.id === id)?.label || id;
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[50vw] max-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex text-left items-center gap-2">
            Detail Pertanyaan
            <Badge
              variant={question.status === "dijawab" ? "default" : "secondary"}
              className={
                question.status === "dijawab"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }
            >
              {question.status === "dijawab"
                ? "Sudah Dijawab"
                : "Belum Dijawab"}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-left">
            Informasi lengkap permohonan advisory
          </DialogDescription>
        </DialogHeader>

        {/* Layout landscape: dua kolom saat ada jawaban */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
          {/* Kolom kiri: Data Permohonan */}
          <div className="flex flex-col gap-4 min-w-0">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Informasi Pemohon
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4 p-4 bg-muted/50 rounded-lg text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Nama Pemohon</p>
                <p className="font-medium">{question.nama_pemohon}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Divisi/Instansi</p>
                <p className="font-medium">{question.divisi_instansi}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Unit Bisnis/Proyek
                </p>
                <p className="font-medium">{question.unit_bisnis}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Tanggal Permohonan
                </p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(question.tanggal_permohonan)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Jenis Advisory
              </h3>
              <div className="flex flex-wrap gap-2">
                {question.jenis_advisory.map((id) => (
                  <Badge key={id} variant="outline">
                    {getAdvisoryLabel(id)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Data/Informasi Yang Diberikan</h3>
              <div className="p-3 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm max-h-40 overflow-y-auto">
                {question.data_informasi}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Advisory Yang Diinginkan</h3>
              <div className="p-3 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm max-h-40 overflow-y-auto">
                {question.advisory_diinginkan}
              </div>
            </div>
          </div>

          {/* Kolom kanan: Jawaban (landscape) */}
          {question.answer ? (
            <div className="flex flex-col gap-4 border-none md:pl-6 min-w-0">
              <h3 className="font-semibold text-green-700 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Jawaban Advisory
              </h3>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col gap-4 min-w-0">
                <div className="flex flex-col gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      No. Registrasi
                    </p>
                    <p className="font-mono font-medium break-all">
                      {question.answer.no_registrasi}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Tanggal Jawaban
                    </p>
                    <p className="font-medium">
                      {formatDate(question.answer.tanggal_jawaban)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Dijawab Oleh
                    </p>
                    <p className="font-medium">{question.answerer_name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    <em>Technical Advisory Note:</em>
                  </p>
                  <div className="p-3 bg-background rounded border whitespace-pre-wrap text-sm max-h-48 overflow-y-auto">
                    {question.answer.technical_advisory_note}
                  </div>
                </div>
              </div>
            </div>
          ) : userRole === "penjawab" ? (
            <div className="md:pl-6">
              <AnswerForm
                question={question}
                onSuccess={() => setOpen(false)}
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
