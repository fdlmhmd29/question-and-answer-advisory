import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect(
      session.user.role === "penanya"
        ? "/dashboard/penanya"
        : "/dashboard/penjawab"
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm flex flex-col gap-6 text-center">
        <h1 className="text-2xl font-bold">Advisory System</h1>
        <p className="text-sm text-muted-foreground">
          Masuk atau daftar untuk melanjutkan
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="block">
            <Button className="w-full" size="lg">
              Masuk
            </Button>
          </Link>
          <Link href="/register" className="block">
            <Button variant="outline" className="w-full" size="lg">
              Daftar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
