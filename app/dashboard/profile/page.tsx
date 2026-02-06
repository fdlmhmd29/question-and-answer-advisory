import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { updateUserProfile } from "@/app/actions/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  async function handleUpdateProfile(formData: FormData) {
    "use server";

    const session = await getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validation
    if (!name || !email) {
      return { error: "Nama dan email harus diisi" };
    }

    let passwordData: { password?: string } = {};
    
    // Only update password if user wants to change it
    if (newPassword) {
      if (!currentPassword) {
        return { error: "Password saat ini harus diisi untuk mengubah password" };
      }

      if (newPassword !== confirmPassword) {
        return { error: "Password baru dan konfirmasi tidak sesuai" };
      }

      if (newPassword.length < 6) {
        return { error: "Password baru minimal 6 karakter" };
      }

      // Verify current password
      const { verifyPassword } = await import("@/lib/auth");
      const userRecord = await (await import("@neondatabase/serverless")).neon(
        process.env.DATABASE_URL!
      )`SELECT password_hash FROM users WHERE id = ${session.user.id}`;

      const isValid = await verifyPassword(currentPassword, userRecord[0].password_hash);
      if (!isValid) {
        return { error: "Password saat ini tidak sesuai" };
      }

      passwordData.password = newPassword;
    }

    const { updateUserProfile: updateUser } = await import("@/lib/auth");
    const result = await updateUser(session.user.id, {
      name,
      email,
      ...passwordData,
    });

    if (!result.success) {
      return { error: result.error };
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/profile");
    return { success: true };
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Link href={user.role === "penanya" ? "/dashboard/penanya" : "/dashboard/penjawab"}>
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Edit Profil</CardTitle>
            <CardDescription>Kelola informasi akun Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleUpdateProfile} className="flex flex-col gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informasi Dasar</h3>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    placeholder="Masukkan email"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Role</Label>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {user.role === "penanya" ? "Penanya (Pembuat Pertanyaan)" : "Penjawab (Pemberi Jawaban)"}
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Ubah Password</h3>
                <p className="text-sm text-muted-foreground">
                  Biarkan kosong jika tidak ingin mengubah password
                </p>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Masukkan password saat ini (jika ingin ubah password)"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Masukkan password baru"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Konfirmasi password baru"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button type="submit" className="flex-1">
                  Simpan Perubahan
                </Button>
                <Link href={user.role === "penanya" ? "/dashboard/penanya" : "/dashboard/penjawab"} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
