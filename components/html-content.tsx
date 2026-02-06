'use client'

import { useMemo } from 'react'

interface HtmlContentProps {
  content: string
  className?: string
}

export function HtmlContent({ content, className = '' }: HtmlContentProps) {
  // Memoize the sanitized HTML to avoid re-rendering
  const sanitizedHtml = useMemo(() => {
    if (!content) return ''
    return content
  }, [content])

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
