# Testing Framework Guide - Advisory System

## Table of Contents
1. [Setup & Configuration](#setup--configuration)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Component Testing](#component-testing)
5. [Hook Testing](#hook-testing)
6. [Server Action Testing](#server-action-testing)
7. [Best Practices](#best-practices)
8. [Coverage Goals](#coverage-goals)

---

## Setup & Configuration

### Installation
Tests are already configured with Jest and React Testing Library. Ensure dependencies are installed:

```bash
npm install
```

### Configuration Files

**jest.config.js** - Main Jest configuration
- Sets up test environment (jsdom)
- Configures module mapping (@/ aliases)
- Defines coverage thresholds
- Specifies test file patterns

**jest.setup.js** - Test environment setup
- Imports testing library utilities
- Mocks Next.js modules (next/navigation, next/image)
- Suppresses console errors during tests

---

## Running Tests

### Run All Tests
```bash
npm run test
```

### Run Tests in Watch Mode
Automatically re-runs tests when files change:
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

This generates a coverage report showing:
- % of functions tested
- % of branches tested
- % of lines tested
- % of statements tested

### Run Specific Test File
```bash
npm test -- rich-text-editor.test.tsx
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should render"
```

---

## Test Structure

### Directory Organization
```
project-root/
├── __tests__/
│   ├── components/
│   │   ├── toast-notification.test.tsx
│   │   ├── dashboard-header.test.tsx
│   │   └── rich-text-editor.test.tsx
│   ├── lib/
│   │   ├── auth.test.ts
│   │   └── utils.test.ts
│   └── actions/
│       └── (server actions tests)
├── jest.config.js
├── jest.setup.js
└── package.json
```

### Basic Test File Template
```typescript
import { render, screen } from '@testing-library/react'
import { ComponentName } from '@/components/component-name'

describe('ComponentName', () => {
  it('should render without crashing', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    render(<ComponentName />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockFunction).toHaveBeenCalled()
  })
})
```

---

## Component Testing

### Testing React Components

#### 1. **Rendering Tests**
```typescript
describe('Button Component', () => {
  it('should render with provided text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should accept className prop', () => {
    const { container } = render(
      <Button className="custom-class">Click</Button>
    )
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
```

#### 2. **Props Testing**
```typescript
describe('Input Component', () => {
  it('should pass through HTML attributes', () => {
    render(
      <Input
        type="password"
        placeholder="Enter password"
        disabled={true}
      />
    )
    
    const input = screen.getByPlaceholderText('Enter password')
    expect(input).toBeDisabled()
  })
})
```

#### 3. **State & Event Handling**
```typescript
describe('Counter Component', () => {
  it('should increment counter on button click', async () => {
    render(<Counter />)
    
    const button = screen.getByRole('button', { name: /increment/i })
    const display = screen.getByText('0')
    
    fireEvent.click(button)
    
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

#### 4. **Conditional Rendering**
```typescript
describe('UserProfile Component', () => {
  it('should show login prompt when not authenticated', () => {
    render(<UserProfile isAuthenticated={false} />)
    expect(screen.getByText('Please log in')).toBeInTheDocument()
  })

  it('should show user info when authenticated', () => {
    render(<UserProfile isAuthenticated={true} userName="John" />)
    expect(screen.getByText('John')).toBeInTheDocument()
  })
})
```

### Testing Form Components

```typescript
describe('QuestionForm', () => {
  it('should submit form with all required fields', async () => {
    const onSubmit = jest.fn()
    render(<QuestionForm onSubmit={onSubmit} />)
    
    // Fill form fields
    const titleInput = screen.getByLabelText('Title')
    const contentInput = screen.getByLabelText('Content')
    
    fireEvent.change(titleInput, { target: { value: 'Test Question' } })
    fireEvent.change(contentInput, { target: { value: 'Test Content' } })
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(submitButton)
    
    expect(onSubmit).toHaveBeenCalled()
  })

  it('should show validation errors for empty fields', async () => {
    render(<QuestionForm />)
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })
})
```

### Testing Async Components

```typescript
describe('AsyncDataComponent', () => {
  it('should display loading state initially', () => {
    render(<AsyncDataComponent />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display data after loading', async () => {
    render(<AsyncDataComponent />)
    
    // Wait for data to load
    const dataElement = await screen.findByText('Data loaded')
    expect(dataElement).toBeInTheDocument()
  })

  it('should display error message on failure', async () => {
    // Mock the API call to fail
    jest.mock('@/lib/api', () => ({
      fetchData: jest.fn().mockRejectedValue(new Error('Failed'))
    }))
    
    render(<AsyncDataComponent />)
    
    const errorMessage = await screen.findByText('Error loading data')
    expect(errorMessage).toBeInTheDocument()
  })
})
```

---

## Hook Testing

### Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useToast } from '@/components/toast-notification'

describe('useToast Hook', () => {
  it('should show toast notification', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current({
        type: 'success',
        title: 'Success',
        message: 'Operation successful',
      })
    })
    
    // Assertions would go here
    expect(result.current).toBeDefined()
  })

  it('should handle multiple toasts', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current({
        type: 'success',
        title: 'Success 1',
        message: 'Message 1',
      })
      result.current({
        type: 'error',
        title: 'Error',
        message: 'Message 2',
      })
    })
    
    expect(result.current).toBeDefined()
  })
})
```

---

## Server Action Testing

### Testing Server Actions with Jest

```typescript
import { submitQuestion } from '@/app/actions/questions'

// Mock database
jest.mock('@/lib/db', () => ({
  sql: jest.fn(),
}))

describe('submitQuestion Action', () => {
  it('should create a question in database', async () => {
    const formData = new FormData()
    formData.append('title', 'Test Question')
    formData.append('content', 'Test Content')
    
    const result = await submitQuestion(formData)
    
    expect(result.success).toBe(true)
  })

  it('should return error for invalid data', async () => {
    const formData = new FormData()
    // Don't append required fields
    
    const result = await submitQuestion(formData)
    
    expect(result.error).toBeDefined()
  })

  it('should handle database errors gracefully', async () => {
    // Mock database error
    jest.mocked(sql).mockRejectedValue(new Error('DB Error'))
    
    const formData = new FormData()
    formData.append('title', 'Test')
    formData.append('content', 'Test')
    
    const result = await submitQuestion(formData)
    
    expect(result.error).toBeDefined()
  })
})
```

---

## Best Practices

### 1. **Use Semantic Queries**
```typescript
// Good - Uses accessible queries
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Enter name')

// Avoid - Implementation details
screen.getByTestId('submit-btn')
container.querySelector('.submit-button')
```

### 2. **Test User Interactions, Not Implementation**
```typescript
// Good - Tests what user sees/does
fireEvent.click(submitButton)
expect(screen.getByText('Success')).toBeInTheDocument()

// Avoid - Testing internal implementation
expect(component.state.submitted).toBe(true)
expect(component.props.onClick).toHaveBeenCalled()
```

### 3. **Wait for Async Operations**
```typescript
// Good
const element = await screen.findByText('Loaded')

// Avoid
const element = screen.queryByText('Loaded')
```

### 4. **Mock External Dependencies**
```typescript
// Good - Mock API calls
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' })
}))

// Avoid - Making real API calls
// Don't call actual endpoints
```

### 5. **Test Accessibility**
```typescript
describe('Accessible Component', () => {
  it('should have proper ARIA attributes', () => {
    render(<Button ariaLabel="Close dialog" />)
    expect(screen.getByLabelText('Close dialog')).toBeInTheDocument()
  })

  it('should be keyboard navigable', () => {
    render(<NavMenu />)
    const menuButton = screen.getByRole('button')
    
    fireEvent.keyDown(menuButton, { key: 'Enter' })
    expect(screen.getByRole('menu')).toBeVisible()
  })
})
```

### 6. **Use describe Blocks for Organization**
```typescript
describe('FormComponent', () => {
  describe('Rendering', () => {
    it('should render all fields', () => {})
    it('should show validation messages', () => {})
  })

  describe('User Interaction', () => {
    it('should submit form on button click', () => {})
    it('should disable submit while loading', () => {})
  })
})
```

### 7. **Clean Up After Tests**
```typescript
describe('Component', () => {
  afterEach(() => {
    // Clean up mocks
    jest.clearAllMocks()
  })

  it('should test something', () => {
    // Test code
  })
})
```

---

## Coverage Goals

### Target Coverage Thresholds
- **Lines:** 80%+
- **Functions:** 80%+
- **Branches:** 75%+
- **Statements:** 80%+

### Checking Coverage
```bash
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Coverage Report Structure
```
coverage/
├── lcov-report/        # HTML coverage report
│   └── index.html      # Open in browser
├── lcov.info          # LCOV format
└── coverage-summary.json
```

---

## Common Testing Patterns

### Testing Modal Dialogs
```typescript
describe('Dialog Component', () => {
  it('should open and close dialog', async () => {
    render(<DialogComponent />)
    
    const openButton = screen.getByRole('button', { name: /open/i })
    fireEvent.click(openButton)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
```

### Testing Dropdown/Select
```typescript
describe('SelectComponent', () => {
  it('should select option from dropdown', async () => {
    render(<Select options={['Option 1', 'Option 2']} />)
    
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    
    const option = screen.getByRole('option', { name: 'Option 2' })
    fireEvent.click(option)
    
    expect(trigger).toHaveValue('Option 2')
  })
})
```

### Testing Tables
```typescript
describe('DataTable', () => {
  it('should render table with data', () => {
    const data = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]
    
    render(<DataTable data={data} />)
    
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })
})
```

---

## Troubleshooting Tests

### Issue: "Cannot find element"
**Solution:** Use `findBy` for async elements, check `data-testid`, verify element exists

### Issue: "Act warning"
**Solution:** Wrap state updates in `act()`:
```typescript
act(() => {
  fireEvent.click(button)
})
```

### Issue: "Module not found"
**Solution:** Check import paths match `jest.config.js` moduleNameMapper

### Issue: "Timeout waiting for element"
**Solution:** Increase timeout or verify element actually renders:
```typescript
await screen.findByText('text', {}, { timeout: 3000 })
```

---

## Testing Checklist

- [ ] All components have unit tests
- [ ] Critical user flows are tested
- [ ] Error scenarios are covered
- [ ] Loading states are tested
- [ ] Form validation is tested
- [ ] API calls are mocked
- [ ] Accessibility is verified
- [ ] Mobile responsiveness is checked
- [ ] Coverage meets 80% threshold
- [ ] All tests pass before deployment

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
