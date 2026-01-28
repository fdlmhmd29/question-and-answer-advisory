import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getQuestions } from "@/lib/questions";
import { DashboardHeader } from "@/components/dashboard-header";
import { QuestionForm } from "@/components/question-form";
import { QuestionsTable } from "@/components/questions-table";
import type { QuestionFilter } from "@/lib/types";

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

export default async function PenanyaDashboard({ searchParams }: PageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "penanya") {
    redirect("/dashboard/penjawab");
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

  const { questions, totalPages, totalCount } = await getQuestions(
    session.user.id,
    "penanya",
    filter
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader userName={session.user.name} userRole="penanya" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Riwayat Pertanyaan</h2>
              <p className="text-muted-foreground">
                Kelola dan pantau permohonan advisory Anda
              </p>
            </div>
            <QuestionForm mode="create" userName={session.user.name} />
          </div>

          {/* Questions Table */}
          <QuestionsTable
            questions={questions}
            totalPages={totalPages}
            totalCount={totalCount}
            currentPage={filter.page || 1}
            userRole="penanya"
          />
        </div>
      </main>
    </div>
  );
}
