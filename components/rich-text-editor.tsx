'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  editorClassName?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Tulis konten di sini...',
  editorClassName = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const applyFormat = (command: string) => {
    // Ensure the editor is focused
    editorRef.current?.focus()
    
    const selection = window.getSelection()
    
    // For list commands, ensure we have proper context
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      // If no selection, select the current line or create a new one
      if (!selection || selection.toString().length === 0) {
        // Insert text first if editor is empty or has no content selected
        if (editorRef.current?.innerText.trim() === '' || !selection?.rangeCount) {
          document.execCommand('insertText', false, 'Itemize this')
        }
        // Select all text in line
        document.execCommand('selectAll', false)
      }
    }
    
    // Execute the format command
    const result = document.execCommand(command, false, undefined)
    
    // Restore cursor position and update
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0)
      editorRef.current?.focus()
    }
    
    // Update content after formatting
    setTimeout(() => {
      updateContent()
    }, 10)
  }

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = () => {
    updateContent()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    updateContent()
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted p-2 flex flex-wrap gap-1 border-b">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyFormat('bold')}
          title="Bold (Ctrl+B)"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyFormat('italic')}
          title="Italic (Ctrl+I)"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyFormat('insertUnorderedList')}
          title="Bullet List"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyFormat('insertOrderedList')}
          title="Numbered List"
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          'min-h-[150px] p-4 focus:outline-none bg-background',
          isFocused ? 'ring-2 ring-ring' : '',
          editorClassName
        )}
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') {
              e.preventDefault()
              applyFormat('bold')
            } else if (e.key === 'i') {
              e.preventDefault()
              applyFormat('italic')
            }
          }
        }}
      />
    </div>
  )
}
