import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, MessageSquare, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Advisory System</h1>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button>Daftar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight text-balance">
            Sistem Manajemen Advisory Terintegrasi
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Platform terpusat untuk mengelola permohonan dan pemberian advisory
            dengan sistem pelacakan yang efisien dan transparan.
          </p>
          <div className="flex gap-4">
            <Link href="/register">
              <Button size="lg">Mulai Sekarang</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Masuk ke Akun
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <Card>
            <CardHeader>
              <FileQuestion className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Ajukan Pertanyaan</CardTitle>
              <CardDescription>
                Buat permohonan advisory dengan mudah melalui form yang terstruktur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground flex flex-col gap-2">
                <li>- Form lengkap dengan 19 jenis advisory</li>
                <li>- Pelacakan status real-time</li>
                <li>- Riwayat pertanyaan tersimpan</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Jawab Advisory</CardTitle>
              <CardDescription>
                Tim advisory dapat memberikan technical advisory note secara efisien
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground flex flex-col gap-2">
                <li>- No. registrasi otomatis</li>
                <li>- Technical advisory note terstruktur</li>
                <li>- Ekspor ke Excel dan gambar</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Aman & Terpercaya</CardTitle>
              <CardDescription>
                Sistem autentikasi yang aman untuk melindungi data permohonan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground flex flex-col gap-2">
                <li>- Autentikasi pengguna</li>
                <li>- Pemisahan akses penanya/penjawab</li>
                <li>- Data terenkripsi</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Default Account Info */}
        <Card className="mt-12 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Akun Penjawab Default</CardTitle>
            <CardDescription>
              Gunakan akun ini untuk login sebagai penjawab/admin
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex flex-col gap-2 bg-muted p-3 rounded-md font-mono">
              <p><span className="text-muted-foreground">Email:</span> admin@advisory.com</p>
              <p><span className="text-muted-foreground">Password:</span> admin123</p>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Jika akun belum aktif, <a href="/api/seed" className="text-primary hover:underline">klik di sini untuk mengaktifkan</a>.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Advisory System - Sistem Manajemen Advisory Terintegrasi</p>
        </div>
      </footer>
    </div>
  );
}
