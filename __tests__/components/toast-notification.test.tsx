import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ToastProvider, useToast } from '@/components/toast-notification'

describe('Toast Notification System', () => {
  // Component to test the useToast hook
  const TestComponent = ({ onToastShow }: { onToastShow?: () => void }) => {
    const toast = useToast()

    const handleShowToast = (type: 'success' | 'error' | 'info' | 'warning') => {
      toast({
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
        message: 'This is a test message',
      })
      onToastShow?.()
    }

    return (
      <div>
        <button onClick={() => handleShowToast('success')} data-testid="success-btn">
          Show Success
        </button>
        <button onClick={() => handleShowToast('error')} data-testid="error-btn">
          Show Error
        </button>
        <button onClick={() => handleShowToast('info')} data-testid="info-btn">
          Show Info
        </button>
        <button onClick={() => handleShowToast('warning')} data-testid="warning-btn">
          Show Warning
        </button>
      </div>
    )
  }

  it('should render ToastProvider without crashing', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should provide useToast hook to children', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    const successBtn = screen.getByTestId('success-btn')
    expect(successBtn).toBeInTheDocument()
  })

  it('should display success toast when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const successBtn = screen.getByTestId('success-btn')
    successBtn.click()

    await waitFor(() => {
      expect(screen.getByText('Success Toast')).toBeInTheDocument()
    })
  })

  it('should display error toast when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const errorBtn = screen.getByTestId('error-btn')
    errorBtn.click()

    await waitFor(() => {
      expect(screen.getByText('Error Toast')).toBeInTheDocument()
    })
  })

  it('should display toast with correct message', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const successBtn = screen.getByTestId('success-btn')
    successBtn.click()

    await waitFor(() => {
      expect(screen.getByText('This is a test message')).toBeInTheDocument()
    })
  })

  it('should handle multiple toast notifications', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const successBtn = screen.getByTestId('success-btn')
    const errorBtn = screen.getByTestId('error-btn')

    successBtn.click()
    errorBtn.click()

    await waitFor(() => {
      expect(screen.getByText('Success Toast')).toBeInTheDocument()
      expect(screen.getByText('Error Toast')).toBeInTheDocument()
    })
  })

  it('should auto-dismiss toasts after timeout', async () => {
    jest.useFakeTimers()

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const successBtn = screen.getByTestId('success-btn')
    successBtn.click()

    await waitFor(() => {
      expect(screen.getByText('Success Toast')).toBeInTheDocument()
    })

    // Fast-forward time by 5 seconds (default auto-dismiss time)
    jest.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(screen.queryByText('Success Toast')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })
})
