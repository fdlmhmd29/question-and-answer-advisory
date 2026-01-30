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
    if (typeof window === "undefined") {
      return;
    }

    setIsExporting(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context tidak tersedia");
      }

      // Ukuran dasar gambar
      const width = 1200;
      const padding = 60;
      const lineHeight = 24;

      // Fungsi bantu untuk membungkus teks
      function wrapText(
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineHeightLocal: number
      ) {
        const words = text.split(" ");
        let line = "";
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + " ";
            currentY += lineHeightLocal;
          } else {
            line = testLine;
          }
        }
        if (line) {
          ctx.fillText(line, x, currentY);
        }
        return currentY;
      }

      // Hitung tinggi kira-kira (supaya cukup untuk semua konten)
      const estimatedHeight = 1000 + Math.max(
        question.data_informasi.length,
        question.advisory_diinginkan.length,
        question.answer.technical_advisory_note.length
      ) / 4;

      canvas.width = width;
      canvas.height = estimatedHeight;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header
      let y = padding;
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 28px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("TECHNICAL ADVISORY NOTE", padding, y);

      y += 36;
      ctx.font = "16px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(
        `No. Registrasi: ${question.answer?.no_registrasi || "-"}`,
        padding,
        y
      );

      y += 30;
      // Garis pemisah hanya sampai tengah (tidak mengganggu kolom kanan)
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width / 2 - 20, y);
      ctx.stroke();

      // Kolom kiri: Data Permohonan
      y += 40;
      const leftX = padding;
      const rightX = width / 2 + 40;

      ctx.font = "bold 18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("DATA PERMOHONAN", leftX, y);

      y += 30;
      ctx.font = "14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      const labelWidth = 180;

      function drawField(label: string, value: string) {
        ctx.fillStyle = "#111827";
        ctx.font = "bold 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(label, leftX, y);

        ctx.fillStyle = "#4b5563";
        ctx.font = "14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
        wrapText(value, leftX + labelWidth, y, width / 2 - labelWidth - padding, lineHeight);
        y += lineHeight + 6;
      }

      drawField("Divisi/Instansi:", question.divisi_instansi);
      drawField("Nama Pemohon:", question.nama_pemohon);
      drawField("Unit Bisnis/Proyek:", question.unit_bisnis);
      drawField("Tgl Permohonan:", formatDate(question.tanggal_permohonan));

      // Jenis Advisory
      y += 10;
      ctx.fillStyle = "#111827";
      ctx.font = "bold 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Jenis Advisory:", leftX, y);

      y += lineHeight;
      ctx.fillStyle = "#4b5563";
      ctx.font = "13px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      const jenisText = question.jenis_advisory
        .map((id) => `${id}. ${getAdvisoryLabel(id)}`)
        .join("  •  ");
      y = wrapText(
        jenisText,
        leftX,
        y,
        width / 2 - padding,
        lineHeight
      ) + lineHeight;

      // Data/Informasi
      y += 10;
      ctx.fillStyle = "#111827";
      ctx.font = "bold 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Data/Informasi Yang Diberikan:", leftX, y);

      y += lineHeight;
      ctx.fillStyle = "#4b5563";
      ctx.font = "13px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      y = wrapText(
        question.data_informasi,
        leftX,
        y,
        width / 2 - padding,
        lineHeight
      ) + lineHeight;

      // Advisory yang diinginkan
      y += 10;
      ctx.fillStyle = "#111827";
      ctx.font = "bold 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Advisory Yang Diinginkan:", leftX, y);

      y += lineHeight;
      ctx.fillStyle = "#4b5563";
      ctx.font = "13px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      const leftBottomY = wrapText(
        question.advisory_diinginkan,
        leftX,
        y,
        width / 2 - padding,
        lineHeight
      ) + lineHeight;

      // Kolom kanan: Jawaban (digeser sedikit ke bawah agar tidak sejajar garis)
      let yRight = padding + 70;
      ctx.fillStyle = "#1d4ed8";
      ctx.font = "bold 18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("TECHNICAL ADVISORY", rightX, yRight);

      yRight += 30;
      ctx.fillStyle = "#111827";
      ctx.font = "bold 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Tanggal Jawaban:", rightX, yRight);
      ctx.fillStyle = "#4b5563";
      ctx.font = "14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(
        formatDate(question.answer.tanggal_jawaban),
        rightX + labelWidth,
        yRight
      );

      yRight += lineHeight + 6;
      ctx.fillStyle = "#111827";
      ctx.font = "bold 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Dijawab oleh:", rightX, yRight);
      ctx.fillStyle = "#4b5563";
      ctx.font = "14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(question.answerer_name || "-", rightX + labelWidth, yRight);

      yRight += lineHeight + 20;
      ctx.fillStyle = "#111827";
      ctx.font = "italic 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Technical Advisory Note :", rightX, yRight);

      yRight += lineHeight + 6;
      ctx.fillStyle = "#4b5563";
      ctx.font = "13px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      const rightBottomY = wrapText(
        question.answer.technical_advisory_note,
        rightX,
        yRight,
        width / 2 - padding * 1.5,
        lineHeight
      ) + lineHeight;

      // Footer
      const footerY = Math.max(leftBottomY, rightBottomY) + 40;
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, footerY);
      ctx.lineTo(width - padding, footerY);
      ctx.stroke();

      ctx.fillStyle = "#6b7280";
      ctx.font = "12px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Advisory System", padding, footerY + 24);
      ctx.fillText(
        `Dicetak pada: ${formatDate(new Date())}`,
        width - padding - 260,
        footerY + 24
      );

      // Sesuaikan tinggi canvas akhir (crop ke konten)
      const finalHeight = footerY + 60;
      if (finalHeight < canvas.height) {
        const tmp = document.createElement("canvas");
        tmp.width = canvas.width;
        tmp.height = finalHeight;
        const tctx = tmp.getContext("2d");
        if (tctx) {
          tctx.drawImage(canvas, 0, 0);
          canvas.width = tmp.width;
          canvas.height = tmp.height;
          ctx.drawImage(tmp, 0, 0);
        }
      }

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.95)
      );

      if (!blob) {
        throw new Error("Gagal membuat gambar dari canvas.");
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `advisory-${
        question.answer?.no_registrasi?.replace(/\//g, "-") || question.id
      }.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
