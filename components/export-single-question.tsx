"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, ImageIcon, Loader2 } from "lucide-react";
import { ADVISORY_TYPES } from "@/lib/types";
import type { QuestionWithAnswer } from "@/lib/types";

interface ExportSingleQuestionProps {
  question: QuestionWithAnswer;
}

export function ExportSingleQuestion({ question }: ExportSingleQuestionProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  async function handleExportImage() {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    
    try {
      // Dynamic import html2canvas
      const html2canvas = (await import("html2canvas")).default;
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        width: 1000,
        height: contentRef.current.scrollHeight,
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `advisory-${question.answer?.no_registrasi?.replace(/\//g, "-") || question.id}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, "image/jpeg", 0.95);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  }

  if (!question.answer || question.status !== "dijawab") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Export ke Gambar">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-screen max-h-[90vh] overflow overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview Export - Technical Advisory Note</DialogTitle>
        </DialogHeader>
        
        {/* Export Content - Landscape Format */}
        <div 
          ref={contentRef}
          className="bg-white p-8 rounded-lg border overflow-x-auto"
          style={{ 
            width: "1000px",
            minHeight: "600px",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              TECHNICAL ADVISORY NOTE
            </h1>
            <p className="text-sm text-slate-600">
              No. Registrasi: <span className="font-semibold">{question.answer?.no_registrasi || "-"}</span>
            </p>
          </div>

          {/* Two Column Layout - Landscape */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Pertanyaan */}
            <div className="border-r pr-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 bg-slate-100 px-3 py-2 -mx-3">
                DATA PERMOHONAN
              </h2>
              
              <div className="flex flex-col gap-4 text-sm">
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="font-semibold text-slate-700">Divisi/Instansi:</span>
                  <span className="text-slate-600">{question.divisi_instansi}</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="font-semibold text-slate-700">Nama Pemohon:</span>
                  <span className="text-slate-600">{question.nama_pemohon}</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="font-semibold text-slate-700">Unit Bisnis/Proyek:</span>
                  <span className="text-slate-600">{question.unit_bisnis}</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="font-semibold text-slate-700">Tgl Permohonan:</span>
                  <span className="text-slate-600">{formatDate(question.tanggal_permohonan)}</span>
                </div>
                
                <div className="mt-2">
                  <p className="font-semibold text-slate-700 mb-2">Jenis Advisory:</p>
                  <div className="flex flex-wrap gap-1">
                    {question.jenis_advisory.map((id) => (
                      <span 
                        key={id}
                        className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded border"
                      >
                        {id}. {getAdvisoryLabel(id)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-2">
                  <p className="font-semibold text-slate-700 mb-1">Data/Informasi Yang Diberikan:</p>
                  <p className="text-slate-600 whitespace-pre-wrap text-xs leading-relaxed bg-slate-50 p-3 rounded border">
                    {question.data_informasi}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700 mb-1">Advisory Yang Diinginkan:</p>
                  <p className="text-slate-600 whitespace-pre-wrap text-xs leading-relaxed bg-slate-50 p-3 rounded border">
                    {question.advisory_diinginkan}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Jawaban */}
            <div className="pl-2">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 bg-blue-50 px-3 py-2 -mx-3">
                TECHNICAL ADVISORY
              </h2>
              
              <div className="flex flex-col gap-4 text-sm">
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="font-semibold text-slate-700">Tanggal Jawaban:</span>
                  <span className="text-slate-600">{formatDate(question.answer.tanggal_jawaban)}</span>
                </div>
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <span className="font-semibold text-slate-700">Dijawab oleh:</span>
                  <span className="text-slate-600">{question.answerer_name || "-"}</span>
                </div>
                
                <div className="mt-4">
                  <p className="font-semibold text-slate-700 mb-2 italic">Technical Advisory Note :</p>
                  <div className="bg-blue-50 p-4 rounded border-2 border-blue-200 min-h-[200px]">
                    <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {question.answer.technical_advisory_note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t flex justify-between items-center text-xs text-slate-500">
            <span>Advisory System</span>
            <span>Dicetak pada: {formatDate(new Date())}</span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Tutup
          </Button>
          <Button onClick={handleExportImage} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengekspor...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download JPG
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
