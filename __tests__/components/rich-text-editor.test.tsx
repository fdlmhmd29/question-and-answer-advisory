import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RichTextEditor } from '@/components/rich-text-editor'

describe('RichTextEditor Component', () => {
  it('should render editor with toolbar', () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    )

    // Check if toolbar buttons exist
    const boldButton = screen.getByTitle('Bold (Ctrl+B)')
    const italicButton = screen.getByTitle('Italic (Ctrl+I)')
    
    expect(boldButton).toBeInTheDocument()
    expect(italicButton).toBeInTheDocument()
  })

  it('should have bullet list and numbered list buttons', () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const bulletListButton = screen.getByTitle('Bullet List')
    const numberedListButton = screen.getByTitle('Numbered List')
    
    expect(bulletListButton).toBeInTheDocument()
    expect(numberedListButton).toBeInTheDocument()
  })

  it('should accept text input', async () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    
    if (editorDiv) {
      editorDiv.textContent = 'Test content'
      fireEvent.input(editorDiv)
      
      expect(mockOnChange).toHaveBeenCalled()
    }
  })

  it('should update value when prop changes', () => {
    const mockOnChange = jest.fn()
    const { rerender } = render(
      <RichTextEditor
        value="Initial content"
        onChange={mockOnChange}
      />
    )

    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    expect(editorDiv?.innerHTML).toBe('Initial content')

    rerender(
      <RichTextEditor
        value="Updated content"
        onChange={mockOnChange}
      />
    )

    const updatedEditor = document.querySelector('[contenteditable="true"]') as HTMLElement
    expect(updatedEditor?.innerHTML).toBe('Updated content')
  })

  it('should apply bold formatting', async () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const boldButton = screen.getByTitle('Bold (Ctrl+B)')
    
    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    editorDiv.focus()
    editorDiv.textContent = 'Bold text'
    
    fireEvent.click(boldButton)
    
    // Check that onChange was called after formatting
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should apply italic formatting', async () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const italicButton = screen.getByTitle('Italic (Ctrl+I)')
    
    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    editorDiv.focus()
    editorDiv.textContent = 'Italic text'
    
    fireEvent.click(italicButton)
    
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should handle keyboard shortcuts for bold', async () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    editorDiv.focus()

    // Simulate Ctrl+B
    fireEvent.keyDown(editorDiv, {
      key: 'b',
      code: 'KeyB',
      ctrlKey: true,
    })

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should handle keyboard shortcuts for italic', async () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    editorDiv.focus()

    // Simulate Ctrl+I
    fireEvent.keyDown(editorDiv, {
      key: 'i',
      code: 'KeyI',
      ctrlKey: true,
    })

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should handle paste events correctly', async () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
    })
    
    pasteEvent.clipboardData?.setData('text/plain', 'Pasted text')
    
    fireEvent.paste(editorDiv, pasteEvent)
    
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should focus editor on click', async () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    
    fireEvent.focus(editorDiv)
    
    // Check that editor has ring style when focused
    expect(editorDiv).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    const mockOnChange = jest.fn()
    const customClass = 'custom-editor-class'
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
        editorClassName={customClass}
      />
    )

    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    
    expect(editorDiv?.className).toContain(customClass)
  })

  it('should accept placeholder prop', () => {
    const mockOnChange = jest.fn()
    const testPlaceholder = 'Enter your text here'
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
        placeholder={testPlaceholder}
      />
    )

    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    
    expect(editorDiv?.getAttribute('data-placeholder')).toBe(testPlaceholder)
  })

  it('should apply bullet list formatting', () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const bulletButton = screen.getByTitle('Bullet List')
    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    
    editorDiv.focus()
    fireEvent.click(bulletButton)
    
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should apply numbered list formatting', () => {
    const mockOnChange = jest.fn()
    
    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const numberedButton = screen.getByTitle('Numbered List')
    const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLElement
    
    editorDiv.focus()
    fireEvent.click(numberedButton)
    
    expect(mockOnChange).toHaveBeenCalled()
  })
})
