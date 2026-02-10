import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { RichTextEditor } from '@/components/rich-text-editor'

jest.mock('next/dynamic', () => {
  return () => {
    const component = require('react-quill-new')
    return component.default || component
  }
})

jest.mock('react-quill-new', () => {
  return function MockReactQuill(props: any) {
    return (
      <div data-testid="quill-editor" className={props.className}>
        <div data-testid="quill-toolbar">
          <button type="button" title="Bold (Ctrl+B)">Bold</button>
          <button type="button" title="Italic (Ctrl+I)">Italic</button>
          <button type="button" title="Bullet List">Bullet</button>
          <button type="button" title="Numbered List">Numbered</button>
        </div>
        <textarea
          data-testid="quill-content"
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      </div>
    )
  }
})

describe('RichTextEditor Component', () => {
  it('renders editor and toolbar', () => {
    const mockOnChange = jest.fn()

    render(<RichTextEditor value="" onChange={mockOnChange} placeholder="Test placeholder" />)

    expect(screen.getByTestId('quill-editor')).toBeInTheDocument()
    expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument()
    expect(screen.getByTitle('Italic (Ctrl+I)')).toBeInTheDocument()
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument()
    expect(screen.getByTitle('Numbered List')).toBeInTheDocument()
  })

  it('accepts text input', () => {
    const mockOnChange = jest.fn()

    render(<RichTextEditor value="" onChange={mockOnChange} />)

    fireEvent.change(screen.getByTestId('quill-content'), { target: { value: '<p>Test content</p>' } })

    expect(mockOnChange).toHaveBeenCalledWith('<p>Test content</p>')
  })

  it('updates value when prop changes', () => {
    const mockOnChange = jest.fn()
    const { rerender } = render(<RichTextEditor value="<p>Initial content</p>" onChange={mockOnChange} />)

    expect(screen.getByTestId('quill-content')).toHaveValue('<p>Initial content</p>')

    rerender(<RichTextEditor value="<p>Updated content</p>" onChange={mockOnChange} />)

    expect(screen.getByTestId('quill-content')).toHaveValue('<p>Updated content</p>')
  })

  it('accepts custom className and placeholder', () => {
    const mockOnChange = jest.fn()

    render(
      <RichTextEditor
        value=""
        onChange={mockOnChange}
        placeholder="Enter your text here"
        editorClassName="custom-editor-class"
      />,
    )

    expect(screen.getByTestId('quill-editor').className).toContain('custom-editor-class')
    expect(screen.getByTestId('quill-content')).toHaveAttribute('placeholder', 'Enter your text here')
  })
})
