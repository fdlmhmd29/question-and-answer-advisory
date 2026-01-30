import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getQuestions, getQuestionCounts } from "@/lib/questions";
import { DashboardHeader } from "@/components/dashboard-header";
import { QuestionsTable } from "@/components/questions-table";
import { PenjawabAddQuestionButton } from "@/components/penjawab-add-question-button";
import type { QuestionFilter } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, CheckCircle, Clock } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    sortBy?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}

export default async function PenjawabDashboard({ searchParams }: PageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "penjawab") {
    redirect("/dashboard/penanya");
  }

  const params = await searchParams;

  const filter: QuestionFilter = {
    status: (params.status as "all" | "belum_dijawab" | "dijawab") || "all",
    sortBy: (params.sortBy as "newest" | "oldest") || "newest",
    search: params.search || "",
    dateFrom: params.dateFrom || "",
    dateTo: params.dateTo || "",
    page: parseInt(params.page || "1"),
  };

  const [{ questions, totalPages, totalCount }, counts] = await Promise.all([
    getQuestions(session.user.id, "penjawab", filter),
    getQuestionCounts(),
  ]);

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader userName={session.user.name} userRole="penjawab" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Dashboard Penjawab</h2>
              <p className="text-muted-foreground">
                Kelola dan jawab permohonan advisory
              </p>
            </div>
            <PenjawabAddQuestionButton />
          </div>

          {/* Stats Cards - total keseluruhan, belum dijawab, sudah dijawab (global) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Pertanyaan</CardTitle>
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Belum Dijawab</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{counts.belum_dijawab}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sudah Dijawab</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{counts.sudah_dijawab}</div>
              </CardContent>
            </Card>
          </div>

          {/* Questions Table */}
          <QuestionsTable
            questions={questions}
            totalPages={totalPages}
            totalCount={totalCount}
            currentPage={filter.page || 1}
            userRole="penjawab"
          />
        </div>
      </main>
    </div>
  );
}
