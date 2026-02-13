"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { submitPublicQuestion } from "@/app/actions/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ADVISORY_TYPES } from "@/lib/types";
import { ArrowLeft, Loader2, MessageSquarePlus, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type View = "select" | "ask" | "login";

export function HomeEntry() {
  const [view, setView] = useState<View>("select");

  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [publicError, setPublicError] = useState<string | null>(null);
  const [publicSuccess, setPublicSuccess] = useState<string | null>(null);
  const [isPublicLoading, setIsPublicLoading] = useState(false);

  const [dataInformasi, setDataInformasi] = useState("");
  const [advisoryDiinginkan, setAdvisoryDiinginkan] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  async function handleLogin(formData: FormData) {
    setIsLoginLoading(true);
    setLoginError(null);

    try {
      const result = await login(formData);
      if (result?.error) {
        setLoginError(result.error);
      }
    } catch {
      // Redirect on success.
    } finally {
      setIsLoginLoading(false);
    }
  }

  async function handlePublicSubmit(formData: FormData) {
    setIsPublicLoading(true);
    setPublicError(null);
    setPublicSuccess(null);

    formData.set("data_informasi", dataInformasi);
    formData.set("advisory_diinginkan", advisoryDiinginkan);
    selectedTypes.forEach((type) => formData.append("jenis_advisory", type));

    const result = await submitPublicQuestion(formData);

    if (result?.error) {
      setPublicError(result.error);
      setIsPublicLoading(false);
      return;
    }

    setPublicSuccess(result?.message || "Pertanyaan berhasil dikirim.");
    setDataInformasi("");
    setAdvisoryDiinginkan("");
    setSelectedTypes([]);
    setIsPublicLoading(false);
  }

  function toggleAdvisoryType(typeId: string) {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId],
    );
  }

  // ── Selection Screen ──
  if (view === "select") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center py-8 px-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-lg animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Selamat Datang</CardTitle>
            <CardDescription className="text-base">
              Silakan pilih salah satu opsi di bawah untuk melanjutkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setView("ask")}
              className="group flex items-center gap-4 rounded-xl border-2 border-transparent bg-primary/5 p-5 text-left transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <MessageSquarePlus className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Langsung Bertanya</p>
                <p className="text-sm text-muted-foreground">
                  Kirim pertanyaan tanpa perlu login atau membuat akun.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setView("login")}
              className="group flex items-center gap-4 rounded-xl border-2 border-transparent bg-primary/5 p-5 text-left transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <LogIn className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Masuk / Daftar</p>
                <p className="text-sm text-muted-foreground">
                  Login ke akun Anda atau daftar akun baru untuk fitur lengkap.
                </p>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Back Button ──
  const backButton = (
    <div className="flex items-center justify-between mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView("select")}
        className="gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>
      <ThemeToggle />
    </div>
  );

  // ── Login View ──
  if (view === "login") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md animate-fade-in">
          {backButton}
          <Card>
            <CardHeader>
              <CardTitle>Masuk ke Akun</CardTitle>
              <CardDescription>
                Login untuk mengakses dashboard dan fitur lengkap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleLogin} className="flex flex-col gap-4">
                {loginError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{loginError}</div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="home-email">Email</Label>
                  <Input id="home-email" name="email" type="email" placeholder="nama@email.com" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="home-password">Password</Label>
                  <Input id="home-password" name="password" type="password" placeholder="Password" required />
                </div>
                <Button type="submit" disabled={isLoginLoading}>
                  {isLoginLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</> : "Masuk"}
                </Button>
              </form>

              <div className="mt-6 rounded-md border p-3 text-sm">
                <p className="font-semibold mb-2">Kelebihan jika Register/Login:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Melihat status jawaban secara real-time.</li>
                  <li>Riwayat pertanyaan tersimpan rapi di dashboard.</li>
                  <li>Bisa edit/hapus pertanyaan sebelum dijawab.</li>
                  <li>Akses fitur ekspor data sesuai kebutuhan.</li>
                </ul>
                <Link href="/register" className="inline-block mt-3 text-primary hover:underline">
                  Daftar akun penanya
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Ask Question View ──
  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container mx-auto max-w-3xl animate-fade-in">
        {backButton}
        <Card>
          <CardHeader>
            <CardTitle>Kirim Pertanyaan Tanpa Login</CardTitle>
            <CardDescription>
              Penanya dapat langsung mengirim pertanyaan dari halaman utama.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handlePublicSubmit} className="flex flex-col gap-4">
              {publicError && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{publicError}</div>}
              {publicSuccess && <div className="bg-emerald-100 text-emerald-700 text-sm p-3 rounded-md">{publicSuccess}</div>}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="divisi_instansi">Divisi/Instansi Pemohon</Label>
                  <Input id="divisi_instansi" name="divisi_instansi" required placeholder="Masukkan divisi/instansi" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nama_pemohon">Nama Pemohon</Label>
                  <Input id="nama_pemohon" name="nama_pemohon" required placeholder="Masukkan nama pemohon" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="unit_bisnis">Unit Bisnis/Proyek/Anak Usaha</Label>
                <Input id="unit_bisnis" name="unit_bisnis" required placeholder="Masukkan unit bisnis" />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="public_data_informasi">Data/Informasi yang Diberikan</Label>
                <RichTextEditor
                  id="public_data_informasi"
                  name="data_informasi"
                  value={dataInformasi}
                  onChange={setDataInformasi}
                  placeholder="Jelaskan data/informasi..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="public_advisory_diinginkan">Advisory Yang Diinginkan</Label>
                <RichTextEditor
                  id="public_advisory_diinginkan"
                  name="advisory_diinginkan"
                  value={advisoryDiinginkan}
                  onChange={setAdvisoryDiinginkan}
                  placeholder="Jelaskan advisory yang diinginkan..."
                />
              </div>

              <div className="flex flex-col gap-3">
                <Label>Jenis Advisory (pilih minimal 1)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto border rounded-md p-3">
                  {ADVISORY_TYPES.map((type) => (
                    <div key={type.id} className="flex items-start gap-2">
                      <Checkbox
                        id={`public-type-${type.id}`}
                        checked={selectedTypes.includes(type.id)}
                        onCheckedChange={() => toggleAdvisoryType(type.id)}
                      />
                      <Label htmlFor={`public-type-${type.id}`} className="text-sm font-normal cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isPublicLoading || selectedTypes.length === 0}>
                  {isPublicLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengirim...</> : "Kirim Pertanyaan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
