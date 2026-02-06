# Troubleshooting Guide - Advisory System Web Application

## Table of Contents
1. [Blank White Screen Issues](#blank-white-screen-issues)
2. [Data Fetching Problems](#data-fetching-problems)
3. [Component Rendering Errors](#component-rendering-errors)
4. [Authentication Issues](#authentication-issues)
5. [Database Connection Problems](#database-connection-problems)
6. [Performance Issues](#performance-issues)
7. [Debugging Tools & Techniques](#debugging-tools--techniques)

---

## Blank White Screen Issues

### Problem Description
User sees a completely blank white screen instead of the application interface.

### Root Causes & Solutions

#### 1. **Hydration Mismatch**
**Symptoms:** 
- Blank screen on page load
- Console error: "Text content does not match server-rendered HTML"
- Page becomes interactive after a few seconds

**Solution:**
```typescript
// Ensure consistent rendering between server and client
// In components, use dynamic imports for client-only components
import dynamic from 'next/dynamic'

const ClientComponent = dynamic(() => import('./client-component'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})
```

#### 2. **JavaScript Execution Error**
**Symptoms:**
- Completely blank page
- Console shows uncaught errors
- Network tab shows HTML loaded successfully

**Solution:**
```typescript
// Add error boundaries in your main layout
import { ErrorBoundary } from './error-boundary'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

#### 3. **Missing Environment Variables**
**Symptoms:**
- Blank screen on initial load
- Network requests returning 500 errors
- `DATABASE_URL` or `SESSION_SECRET` undefined

**Solution:**
1. Check `.env.local` exists with all required variables:
   ```
   DATABASE_URL=postgresql://...
   SESSION_SECRET=your_secret_key
   ```

2. Create a validation utility:
```typescript
// lib/env.ts
const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET']

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  )
  
  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}`
    )
  }
}
```

#### 4. **Provider Not Wrapping Children**
**Symptoms:**
- Toast notifications don't work
- Theme provider functionality broken
- Context consumers show no data

**Solution:**
```typescript
// app/layout.tsx - Ensure all providers wrap children
import { ToastProvider } from '@/components/toast-notification'
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## Data Fetching Problems

### Problem: Data Not Loading on Page

**Diagnosis Steps:**
1. Open Network tab in DevTools
2. Check for failed requests (red status codes)
3. Verify response data format
4. Check console for fetch errors

**Common Solutions:**

#### Solution 1: Handle Missing Data
```typescript
// components/question-list.tsx
import { getQuestions } from '@/lib/questions'

export async function QuestionsList() {
  try {
    const questions = await getQuestions()
    
    if (!questions || questions.length === 0) {
      return <div className="text-center p-8">No questions found</div>
    }
    
    return (
      <div>
        {questions.map(q => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>
    )
  } catch (error) {
    console.error('[v0] Failed to fetch questions:', error)
    return (
      <div className="text-red-500 p-4">
        Failed to load questions. Please try again later.
      </div>
    )
  }
}
```

#### Solution 2: Database Connection Check
```typescript
// lib/db.ts - Add connection verification
import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)

export async function verifyConnection() {
  try {
    const result = await sql`SELECT 1 as connected`
    return !!result
  } catch (error) {
    console.error('[v0] Database connection failed:', error)
    return false
  }
}
```

---

## Component Rendering Errors

### Problem: "Cannot read property of undefined"

**Root Cause:** Component trying to access props that don't exist

**Solution:**
```typescript
// Before
function QuestionDetail({ question }: Props) {
  return <div>{question.title}</div> // Fails if question is undefined
}

// After
function QuestionDetail({ question }: Props) {
  if (!question) {
    return <div className="text-muted-foreground">Loading...</div>
  }
  
  return <div>{question.title}</div>
}
```

### Problem: Conditional Rendering Not Working

**Solution:**
```typescript
// Bad - Can cause hydration issues
{user && user.role === 'admin' && <AdminPanel />}

// Good - Wraps client component
import dynamic from 'next/dynamic'

const AdminPanel = dynamic(() => import('./admin-panel'), {
  ssr: false,
})

// Then safe to conditionally render
{user?.role === 'admin' && <AdminPanel />}
```

---

## Authentication Issues

### Problem: Users Unable to Login/Register

**Debugging Checklist:**
- [ ] Check if form is being submitted (Network tab)
- [ ] Verify request payload in Network tab
- [ ] Check response status (200 vs 401/500)
- [ ] Verify database contains user data
- [ ] Check session cookie is set

**Solution:**
```typescript
// app/actions/auth.ts - Add detailed error logging
export async function loginUser(email: string, password: string) {
  console.log('[v0] Login attempt for:', email)
  
  try {
    const user = await sql`SELECT * FROM users WHERE email = ${email}`
    
    if (!user || user.length === 0) {
      console.log('[v0] User not found:', email)
      return { success: false, error: 'Email atau password salah' }
    }
    
    const isValid = await verifyPassword(password, user[0].password_hash)
    
    if (!isValid) {
      console.log('[v0] Invalid password for:', email)
      return { success: false, error: 'Email atau password salah' }
    }
    
    console.log('[v0] Login successful for:', email)
    await createSession(user[0].id)
    return { success: true, user: user[0] }
  } catch (error) {
    console.error('[v0] Login error:', error)
    return { success: false, error: 'Terjadi kesalahan saat login' }
  }
}
```

---

## Database Connection Problems

### Problem: "Can't reach the database server"

**Debugging Steps:**

1. **Verify DATABASE_URL format:**
```bash
# Should look like:
# postgresql://user:password@host:port/database
echo $DATABASE_URL
```

2. **Test connection:**
```typescript
// lib/db.test.ts
import { verifyConnection } from './db'

test('database connection should work', async () => {
  const connected = await verifyConnection()
  expect(connected).toBe(true)
})
```

3. **Check Neon console:**
   - Visit Neon dashboard
   - Verify database is active
   - Check connection pool settings
   - Review query logs

---

## Performance Issues

### Problem: Slow Page Loads

**Analysis Approach:**

1. **Check Network Waterfall:**
   - Which requests are slowest?
   - Are there many sequential requests?
   - Can requests be parallelized?

2. **Optimize Data Fetching:**
```typescript
// Bad - Sequential queries
const questions = await getQuestions()
const answers = await getAnswers()

// Good - Parallel queries
const [questions, answers] = await Promise.all([
  getQuestions(),
  getAnswers(),
])
```

3. **Implement Caching:**
```typescript
// lib/questions.ts - Add revalidation
export async function getQuestions() {
  return await sql`SELECT * FROM questions`
}

// In page.tsx
const questions = await getQuestions()
revalidateTag('questions', 'max')
```

---

## Debugging Tools & Techniques

### 1. **Browser DevTools**

**Console Tab:**
```typescript
// Add debug logging with context
console.log('[v0] Rendering QuestionForm with props:', props)
console.log('[v0] State updated:', newState)
console.log('[v0] API response:', response)
```

**Network Tab:**
- Filter by XHR to see API calls
- Check request/response payloads
- Monitor status codes
- Look for failed requests (red)

**Application Tab:**
- Check localStorage for session data
- Verify cookies are set correctly
- Check IndexedDB for cache

### 2. **Server-Side Debugging**

**Add Debug Logging:**
```typescript
// In server actions
'use server'

import { sql } from '@/lib/db'

export async function submitQuestion(formData: FormData) {
  console.log('[v0] Submitting question with data:', formData)
  
  try {
    const result = await sql`INSERT INTO questions (...) VALUES (...)`
    console.log('[v0] Question created:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('[v0] Question creation failed:', error)
    return { success: false, error: 'Failed to submit question' }
  }
}
```

**Check Server Logs:**
```bash
# In development
npm run dev  # Watch console output

# In production
# Check Vercel deployment logs
# Or use: vercel logs
```

### 3. **Component Debugging**

**Use React DevTools:**
1. Install React Developer Tools extension
2. Inspect component tree
3. View props and state
4. Trace re-renders

**Add Component Wrapper:**
```typescript
export function DebugQuestionForm(props) {
  console.log('[v0] QuestionForm rendered with props:', props)
  
  return (
    <>
      <div className="bg-yellow-100 p-2 text-xs mb-4">
        [DEBUG] QuestionForm - Props: {JSON.stringify(props)}
      </div>
      <QuestionForm {...props} />
    </>
  )
}
```

### 4. **Error Boundary for Production**

```typescript
// components/error-boundary.tsx
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[v0] Error caught by boundary:', error)
    console.error('[v0] Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-bold">Something went wrong</h2>
          <p className="text-red-600 mt-2">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## Quick Reference: Common Fixes

| Issue | Quick Fix |
|-------|-----------|
| Blank screen | Check browser console for errors |
| Page loads but no data | Verify DATABASE_URL and test query directly |
| Hydration mismatch | Use `dynamic` imports for client components |
| Auth not working | Check cookies in DevTools Application tab |
| Slow page loads | Check Network tab for slow requests |
| CSS not loading | Clear `.next` folder and rebuild |
| TypeScript errors | Run `npm run build` to see full output |

---

## Testing Your Fixes

After implementing a fix, verify it with:

```bash
# 1. Clear cache
rm -rf .next
rm -rf node_modules
npm install

# 2. Run development server
npm run dev

# 3. Run tests
npm run test

# 4. Build for production
npm run build

# 5. Start production server
npm run start
```

## Reporting Issues

When reporting a blank screen issue, include:
1. Browser and version
2. Steps to reproduce
3. Screenshot of blank screen
4. Browser console output
5. Network tab requests (esp. failed ones)
6. Server logs output
