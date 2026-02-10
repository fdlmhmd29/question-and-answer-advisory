"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADVISORY_TYPES } from "@/lib/types";
import type { QuestionWithAnswer } from "@/lib/types";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { htmlToPlainText } from "@/lib/export-utils";

interface ExportButtonsProps {
  questions: QuestionWithAnswer[];
}

export function ExportButtons({ questions }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<"all" | "dijawab" | "belum_dijawab">("all");
  const [exportDateFrom, setExportDateFrom] = useState("");
  const [exportDateTo, setExportDateTo] = useState("");

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

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (exportStatus !== "all" && q.status !== exportStatus) {
        return false;
      }

      const requestDate = new Date(q.tanggal_permohonan);

      if (exportDateFrom) {
        const from = new Date(`${exportDateFrom}T00:00:00`);
        if (requestDate < from) return false;
      }

      if (exportDateTo) {
        const to = new Date(`${exportDateTo}T23:59:59`);
        if (requestDate > to) return false;
      }

      return true;
    });
  }, [questions, exportStatus, exportDateFrom, exportDateTo]);

  async function exportToExcel() {
    setIsExporting(true);

    try {
      const summaryHeaders = [
        "No",
        "Status",
        "No Registrasi",
        "Tanggal Permohonan",
        "Tanggal Jawaban",
        "Nama Pemohon",
        "Divisi/Instansi",
        "Unit Bisnis",
        "Jenis Advisory",
        "Dijawab Oleh",
      ];

      const summaryRows = filteredQuestions.map((q, index) => [
        index + 1,
        q.status === "dijawab" ? "Sudah Dijawab" : "Belum Dijawab",
        q.answer?.no_registrasi || "-",
        formatDate(q.tanggal_permohonan),
        q.answer ? formatDate(q.answer.tanggal_jawaban) : "-",
        q.nama_pemohon,
        q.divisi_instansi,
        q.unit_bisnis,
        q.jenis_advisory.map((id) => `${id}. ${getAdvisoryLabel(id)}`).join("; "),
        q.answerer_name || "-",
      ]);

      const detailHeaders = [
        "No",
        "Status",
        "No Registrasi",
        "Divisi/Instansi",
        "Nama Pemohon",
        "Unit Bisnis",
        "Hari/Tanggal Permohonan",
        "Hari/Tanggal Jawaban",
        "Jenis Advisory",
        "Data/Informasi Yang Diberikan",
        "Advisory Yang Diinginkan",
        "Technical Advisory Note",
      ];

      const detailRows = filteredQuestions.map((q, index) => [
        index + 1,
        q.status === "dijawab" ? "Sudah Dijawab" : "Belum Dijawab",
        q.answer?.no_registrasi || "-",
        q.divisi_instansi,
        q.nama_pemohon,
        q.unit_bisnis,
        formatDate(q.tanggal_permohonan),
        q.answer ? formatDate(q.answer.tanggal_jawaban) : "-",
        q.jenis_advisory.map((id) => `${id}. ${getAdvisoryLabel(id)}`).join("; "),
        htmlToPlainText(q.data_informasi),
        htmlToPlainText(q.advisory_diinginkan),
        htmlToPlainText(q.answer?.technical_advisory_note || "-"),
      ]);

      const wb = XLSX.utils.book_new();

      const summarySheet = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
      summarySheet["!cols"] = [
        { wch: 5 },
        { wch: 16 },
        { wch: 16 },
        { wch: 18 },
        { wch: 18 },
        { wch: 22 },
        { wch: 22 },
        { wch: 20 },
        { wch: 34 },
        { wch: 18 },
      ];

      const detailSheet = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
      detailSheet["!cols"] = [
        { wch: 5 },
        { wch: 16 },
        { wch: 16 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 32 },
        { wch: 45 },
        { wch: 45 },
        { wch: 45 },
      ];

      XLSX.utils.book_append_sheet(wb, summarySheet, "Ringkasan Pertanyaan");
      XLSX.utils.book_append_sheet(wb, detailSheet, "Detail Pertanyaan");

      XLSX.writeFile(
        wb,
        `semua-pertanyaan-advisory-${new Date().toISOString().split("T")[0]}.xlsx`,
      );
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileSpreadsheet className="h-4 w-4" />
          Ekspor Semua Pertanyaan (Penjawab)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Kategori Status</Label>
            <Select value={exportStatus} onValueChange={(value: "all" | "dijawab" | "belum_dijawab") => setExportStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Keduanya</SelectItem>
                <SelectItem value="dijawab">Sudah Dijawab</SelectItem>
                <SelectItem value="belum_dijawab">Belum Dijawab</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs">Dari Tanggal</Label>
            <Input
              type="date"
              value={exportDateFrom}
              onChange={(e) => setExportDateFrom(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs">Sampai Tanggal</Label>
            <Input
              type="date"
              value={exportDateTo}
              onChange={(e) => setExportDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Data siap diekspor: <span className="font-semibold">{filteredQuestions.length}</span> pertanyaan
          </p>
          <Button
            onClick={exportToExcel}
            disabled={isExporting || filteredQuestions.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengekspor...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Ekspor XLSX
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
