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
import { Loader2 } from "lucide-react";

export function HomeEntry() {
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

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container mx-auto grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Masuk ke Akun</CardTitle>
            <CardDescription>
              Login langsung dari halaman utama. Belum punya akun? Bisa tetap kirim pertanyaan tanpa login.
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

        <Card className="lg:col-span-2">
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
                <Label>Data/Informasi yang Diberikan</Label>
                <RichTextEditor
                  value={dataInformasi}
                  onChange={setDataInformasi}
                  placeholder="Jelaskan data/informasi..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Advisory Yang Diinginkan</Label>
                <RichTextEditor
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
