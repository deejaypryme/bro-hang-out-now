import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { screen } from '@testing-library/dom'
import { render, userEvent } from '@/test-utils'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we're intentionally throwing errors
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })
  
  afterAll(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Reload Page')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onErrorMock = vi.fn()
    
    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onErrorMock).toHaveBeenCalled()
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.any(Object)
    )
  })

  it('shows error details when expanded', async () => {
    const { user } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Click on the error details summary
    const errorDetailsButton = screen.getByText('Error Details')
    await user.click(errorDetailsButton)

    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('resets error state when Try Again is clicked', async () => {
    let shouldThrow = true
    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />
    
    const { rerender, user } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )

    // Verify error is shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Fix the error condition
    shouldThrow = false
    
    // Click Try Again
    const tryAgainButton = screen.getByText('Try Again')
    await user.click(tryAgainButton)

    // Re-render with fixed component
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )

    // Should now show the working component
    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})