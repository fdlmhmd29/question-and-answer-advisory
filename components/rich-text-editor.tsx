'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
})

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  editorClassName?: string
}

const quillModules = {
  toolbar: [
    ['bold', 'italic'],
    [{ list: 'bullet' }, { list: 'ordered' }],
  ],
}

const quillFormats = ['bold', 'italic', 'list', 'bullet']

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Tulis konten di sini...',
  editorClassName = '',
}: RichTextEditorProps) {
  return (
    <div className="border rounded-md overflow-hidden bg-background">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder}
        className={cn('min-h-[150px] [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[150px]', editorClassName)}
      />
    </div>
  )
}
