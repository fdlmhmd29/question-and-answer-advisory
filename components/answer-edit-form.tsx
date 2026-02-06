'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/rich-text-editor'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { editAnswer } from '@/app/actions/questions'
import type { Answer } from '@/lib/types'
import { Loader2, Pencil } from 'lucide-react'

interface AnswerEditFormProps {
  answer: Answer
  onSuccess?: () => void
}

export function AnswerEditForm({ answer, onSuccess }: AnswerEditFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [technicalNote, setTechnicalNote] = useState(answer.technical_advisory_note || '')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    formData.set('technical_advisory_note', technicalNote)

    try {
      const result = await editAnswer(answer.id, formData)

      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        router.refresh()
        onSuccess?.()
      }
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Edit jawaban">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[50vw] max-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Jawaban</DialogTitle>
          <DialogDescription>
            Perbarui technical advisory note
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>No. Registrasi</Label>
            <div className="text-sm font-mono bg-muted p-3 rounded-md">
              {answer.no_registrasi}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="technical_advisory_note" className="italic">
              Technical Advisory Note:
            </Label>
            <RichTextEditor
              value={technicalNote}
              onChange={setTechnicalNote}
              placeholder="Tulis technical advisory note di sini..."
              editorClassName="[&_.ProseMirror]:min-h-[200px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
