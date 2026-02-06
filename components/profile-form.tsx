'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfile } from '@/app/actions/auth'
import { useToast } from '@/components/toast-notification'
import { ChevronLeft, Loader2 } from 'lucide-react'

interface ProfileFormProps {
  userName: string
  userEmail: string
  userRole: 'penanya' | 'penjawab'
}

export function ProfileForm({ userName, userEmail, userRole }: ProfileFormProps) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formDataObj = new FormData()
    formDataObj.set('name', formData.name)
    formDataObj.set('email', formData.email)
    formDataObj.set('currentPassword', formData.currentPassword)
    formDataObj.set('newPassword', formData.newPassword)
    formDataObj.set('confirmPassword', formData.confirmPassword)

    try {
      const result = await updateProfile(formDataObj)

      if (result?.error) {
        setError(result.error)
        toast({
          type: 'error',
          title: 'Gagal Memperbarui Profil',
          message: result.error,
        })
      } else {
        toast({
          type: 'success',
          title: 'Profil Berhasil Diperbarui',
          message: 'Perubahan profil Anda telah disimpan.',
        })
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
      }
    } catch (error) {
      const errorMessage = 'Terjadi kesalahan saat memperbarui profil'
      setError(errorMessage)
      toast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const dashboardLink = userRole === 'penanya' ? '/dashboard/penanya' : '/dashboard/penjawab'

  return (
    <div className="min-h-screen w-full bg-background">
      <main className="w-full px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <Link href={dashboardLink}>
            <Button variant="ghost" size="sm" className="mb-4 sm:mb-6">
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Kembali ke Dashboard</span>
              <span className="sm:hidden">Kembali</span>
            </Button>
          </Link>

          <Card className="animate-fade-in">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl">Edit Profil</CardTitle>
              <CardDescription>Kelola informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md animate-slide-in-up">
                    {error}
                  </div>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">Informasi Dasar</h3>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name" className="text-sm sm:text-base">
                      Nama Lengkap
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      required
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Masukkan email"
                      required
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-sm sm:text-base">Role</Label>
                    <div className="bg-muted p-2.5 sm:p-3 rounded-md text-sm">
                      {userRole === 'penanya'
                        ? 'Penanya (Pembuat Pertanyaan)'
                        : 'Penjawab (Pemberi Jawaban)'}
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="space-y-4 border-t pt-6 sm:pt-8">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">Ubah Password</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Biarkan kosong jika tidak ingin mengubah password
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="currentPassword" className="text-sm sm:text-base">
                      Password Saat Ini
                    </Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Masukkan password saat ini (jika ingin ubah password)"
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="newPassword" className="text-sm sm:text-base">
                      Password Baru
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Masukkan password baru"
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword" className="text-sm sm:text-base">
                      Konfirmasi Password Baru
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Konfirmasi password baru"
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 pt-6 sm:pt-8 border-t flex-col-reverse sm:flex-row">
                  <Link href={dashboardLink} className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-sm sm:text-base"
                      disabled={isLoading}
                    >
                      Batal
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
