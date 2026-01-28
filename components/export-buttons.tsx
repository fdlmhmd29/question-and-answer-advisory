"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADVISORY_TYPES } from "@/lib/types";
import type { QuestionWithAnswer } from "@/lib/types";
import { Download, FileSpreadsheet, ImageIcon, Loader2 } from "lucide-react";

interface ExportButtonsProps {
  questions: QuestionWithAnswer[];
}

export function ExportButtons({ questions }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  function getAdvisoryLabel(id: string) {
    return ADVISORY_TYPES.find((t) => t.id === id)?.label || id;
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  async function exportToExcel() {
    setIsExporting(true);

    try {
      // Create CSV content
      const headers = [
        "No",
        "Tanggal Permohonan",
        "Nama Pemohon",
        "Divisi/Instansi",
        "Unit Bisnis",
        "Jenis Advisory",
        "Data/Informasi",
        "Advisory Diinginkan",
        "Status",
        "No Registrasi",
        "Tanggal Jawaban",
        "Technical Advisory Note",
      ];

      const rows = questions.map((q, index) => [
        index + 1,
        formatDate(q.tanggal_permohonan),
        q.nama_pemohon,
        q.divisi_instansi,
        q.unit_bisnis,
        q.jenis_advisory.map((id) => `${id}. ${getAdvisoryLabel(id)}`).join("; "),
        q.data_informasi.replace(/"/g, '""'),
        q.advisory_diinginkan.replace(/"/g, '""'),
        q.status === "dijawab" ? "Sudah Dijawab" : "Belum Dijawab",
        q.answer?.no_registrasi || "-",
        q.answer ? formatDate(q.answer.tanggal_jawaban) : "-",
        q.answer?.technical_advisory_note?.replace(/"/g, '""') || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${cell}"`).join(",")
        ),
      ].join("\n");

      // Add BOM for Excel UTF-8 compatibility
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `advisory_questions_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  }

  async function exportToImage() {
    setIsExporting(true);

    try {
      // Create a canvas for the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const padding = 40;
      const rowHeight = 30;
      const headerHeight = 50;
      const columnWidths = [40, 100, 150, 150, 150, 100, 120];
      const totalWidth = columnWidths.reduce((a, b) => a + b, 0) + padding * 2;
      const totalHeight =
        headerHeight + rowHeight * (questions.length + 1) + padding * 2;

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Title
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("Daftar Pertanyaan Advisory", padding, padding + 20);

      // Headers
      const headers = [
        "No",
        "Tanggal",
        "Pemohon",
        "Divisi",
        "Unit Bisnis",
        "Status",
        "No Reg",
      ];

      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(
        padding,
        padding + headerHeight,
        totalWidth - padding * 2,
        rowHeight
      );

      ctx.fillStyle = "#374151";
      ctx.font = "bold 12px sans-serif";
      let xPos = padding + 10;
      headers.forEach((header, i) => {
        ctx.fillText(header, xPos, padding + headerHeight + 20);
        xPos += columnWidths[i];
      });

      // Data rows
      ctx.font = "12px sans-serif";
      questions.forEach((q, index) => {
        const y = padding + headerHeight + rowHeight * (index + 1);

        // Alternate row colors
        if (index % 2 === 1) {
          ctx.fillStyle = "#f9fafb";
          ctx.fillRect(padding, y, totalWidth - padding * 2, rowHeight);
        }

        ctx.fillStyle = "#374151";
        xPos = padding + 10;

        const rowData = [
          String(index + 1),
          formatDate(q.tanggal_permohonan),
          q.nama_pemohon.substring(0, 20),
          q.divisi_instansi.substring(0, 20),
          q.unit_bisnis.substring(0, 20),
          q.status === "dijawab" ? "Dijawab" : "Pending",
          q.answer?.no_registrasi || "-",
        ];

        rowData.forEach((cell, i) => {
          ctx.fillText(cell, xPos, y + 20);
          xPos += columnWidths[i];
        });
      });

      // Border
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        padding,
        padding + headerHeight,
        totalWidth - padding * 2,
        rowHeight * (questions.length + 1)
      );

      // Download
      const link = document.createElement("a");
      link.download = `advisory_questions_${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || questions.length === 0}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengekspor...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Ekspor Data
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Ekspor ke Excel (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToImage}>
          <ImageIcon className="mr-2 h-4 w-4" />
          Ekspor ke Gambar (PNG)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
