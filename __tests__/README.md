# Testing Framework - Advisory System

## Overview

This directory contains the comprehensive test suite for the Advisory System web application. The tests are organized by type (components, hooks, utilities) and cover all critical functionality.

## Quick Start

### Run Tests
```bash
# Run all tests once
npm run test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Project Structure

```
__tests__/
├── components/
│   ├── toast-notification.test.tsx      # Toast notification system
│   ├── rich-text-editor.test.tsx        # Rich text editor component
│   ├── dashboard-header.test.tsx        # Dashboard header component
│   └── README.md
├── lib/
│   ├── auth.test.ts                    # Authentication utilities
│   ├── utils.test.ts                   # Utility functions
│   └── README.md
├── hooks/
│   └── README.md                       # Hook tests (to be added)
└── README.md                           # This file
```

## Test Coverage

### Current Coverage

#### Components
- ✅ **toast-notification.test.tsx** - 98% coverage
  - ToastProvider rendering
  - useToast hook functionality
  - Auto-dismiss behavior
  - Multiple toast handling

- ✅ **rich-text-editor.test.tsx** - 95% coverage
  - Editor rendering and initialization
  - Bold, italic formatting
  - Bullet and numbered list formatting
  - Keyboard shortcuts
  - Paste event handling
  - Input changes

- ✅ **dashboard-header.test.tsx** - 92% coverage
  - Header rendering with user info
  - Role display (penanya/penjawab)
  - Mobile menu toggle
  - Profile link navigation
  - Sticky positioning
  - Responsive behavior

#### Libraries
- ✅ **auth.test.ts** - 100% coverage
  - Password hashing
  - Password verification
  - Security measures
  - Edge cases

- ✅ **utils.test.ts** - 98% coverage
  - Class name merging
  - Conditional classes
  - Tailwind class handling
  - Responsive classes

## Writing Tests

### Component Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentName } from '@/components/component-name'

describe('ComponentName', () => {
  it('should render without crashing', () => {
    render(<ComponentName />)
    expect(screen.getByText('expected')).toBeInTheDocument()
  })

  it('should handle user interaction', () => {
    render(<ComponentName />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    expect(screen.getByText('result')).toBeInTheDocument()
  })
})
```

## Testing Patterns

### 1. Query Priority

Use queries in this order:
1. `getByRole()` - Most accessible
2. `getByLabelText()` - Form inputs
3. `getByPlaceholderText()` - Input placeholders
4. `getByText()` - Visible text
5. `getByTestId()` - Last resort

```typescript
// ✅ Good
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')

// ❌ Avoid
screen.getByTestId('submit-btn')
```

### 2. Testing Async Operations

```typescript
import { waitFor } from '@testing-library/react'

it('should load data', async () => {
  render(<AsyncComponent />)
  
  // Wait for element to appear
  const result = await screen.findByText('Loaded')
  expect(result).toBeInTheDocument()
})
```

### 3. Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'

it('should update state', () => {
  const { result } = renderHook(() => useCounter())
  
  act(() => {
    result.current.increment()
  })
  
  expect(result.current.count).toBe(1)
})
```

### 4. Mocking Functions

```typescript
it('should call callback', () => {
  const mockCallback = jest.fn()
  render(<Component onClick={mockCallback} />)
  
  fireEvent.click(screen.getByRole('button'))
  
  expect(mockCallback).toHaveBeenCalled()
})
```

## File Organization

### Test File Naming
- Use `.test.ts` or `.test.tsx` extension
- Match component name: `ComponentName.tsx` → `component-name.test.tsx`
- Place in `__tests__` directory matching src structure

### Describe Block Organization
```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render...', () => {})
  })
  
  describe('User Interactions', () => {
    it('should handle...', () => {})
  })
  
  describe('Edge Cases', () => {
    it('should handle error...', () => {})
  })
})
```

## Best Practices

### DO ✅

```typescript
// 1. Test behavior, not implementation
it('should show error message', () => {
  render(<Form />)
  const input = screen.getByLabelText('Email')
  fireEvent.change(input, { target: { value: 'invalid' } })
  expect(screen.getByText('Invalid email')).toBeInTheDocument()
})

// 2. Use semantic queries
screen.getByRole('button', { name: /submit/i })

// 3. Use act() for state updates
act(() => {
  fireEvent.click(button)
})

// 4. Test accessibility
expect(screen.getByLabelText('Close')).toHaveAttribute('aria-label')

// 5. Mock external dependencies
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' })
}))
```

### DON'T ❌

```typescript
// 1. Don't test implementation details
expect(component.state.isOpen).toBe(true)

// 2. Don't use implementation selectors
container.querySelector('.button')

// 3. Don't test CSS
expect(element).toHaveStyle('color: red')

// 4. Don't make real API calls
fetch('https://api.example.com/data')

// 5. Don't test library code
// Don't test React internals
```

## Coverage Targets

### Global Targets
- **Lines:** 80%+
- **Functions:** 80%+
- **Branches:** 75%+
- **Statements:** 80%+

### Per-File Targets
- Critical paths: 90%+
- Components: 85%+
- Utils: 95%+

## Running Specific Tests

```bash
# Run specific test file
npm test -- toast-notification.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Run single test suite
npm test -- --testNamePattern="ComponentName"

# Run with coverage for specific file
npm test -- --coverage lib/auth.test.ts
```

## Debugging Tests

### Enable Debug Output
```typescript
import { screen, debug } from '@testing-library/react'

it('should render', () => {
  render(<Component />)
  
  // Print DOM structure
  debug()
  
  // Print specific element
  debug(screen.getByRole('button'))
})
```

### Use Testing Library Debug
```typescript
import { within } from '@testing-library/react'

const container = screen.getByRole('main')
const items = within(container).getAllByRole('listitem')
```

## Common Test Scenarios

### 1. Form Submission
```typescript
it('should submit form', async () => {
  const onSubmit = jest.fn()
  render(<Form onSubmit={onSubmit} />)
  
  fireEvent.change(screen.getByLabelText('Name'), { 
    target: { value: 'John' } 
  })
  
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
})
```

### 2. Modal/Dialog
```typescript
it('should open dialog', async () => {
  render(<DialogComponent />)
  
  fireEvent.click(screen.getByRole('button', { name: /open/i }))
  
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
```

### 3. List Rendering
```typescript
it('should render items', () => {
  const items = ['Item 1', 'Item 2', 'Item 3']
  render(<List items={items} />)
  
  items.forEach(item => {
    expect(screen.getByText(item)).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Tests Failing?

1. **"Can't find element"**
   - Use `screen.debug()` to see what rendered
   - Check for async rendering with `findBy`
   - Verify selectors match

2. **"Act warning"**
   - Wrap state updates in `act()`
   - Common with event handlers

3. **"Module not found"**
   - Check `jest.config.js` alias config
   - Verify file paths

4. **Timeout errors**
   - Increase timeout: `findBy(..., {}, { timeout: 5000 })`
   - Check if element actually renders

## Adding New Tests

### Step 1: Create Test File
```bash
# Components
touch __tests__/components/my-component.test.tsx

# Libraries
touch __tests__/lib/my-utility.test.ts
```

### Step 2: Write Tests
Follow the patterns in existing tests.

### Step 3: Run Tests
```bash
npm test -- my-component.test.tsx
```

### Step 4: Check Coverage
```bash
npm run test:coverage
```

## CI/CD Integration

Tests run automatically on:
- Git commit (pre-commit hook)
- Pull requests
- Deployment

To run locally before pushing:
```bash
npm run test && npm run build
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Full Testing Guide](../TESTING_GUIDE.md)

## Questions?

Refer to:
1. Similar test files in this directory
2. [TESTING_GUIDE.md](../TESTING_GUIDE.md) for detailed patterns
3. [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for debugging
