# Debug Quick Start Guide

## Blank White Screen? Follow These Steps

### Step 1: Check Browser Console (30 seconds)
1. Open DevTools: `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
2. Click **Console** tab
3. Look for red error messages
4. **Copy the error and search for it below**

### Step 2: Check Network Tab (1 minute)
1. Open DevTools → **Network** tab
2. Reload page: `F5`
3. Look for requests with red color (failed requests)
4. **Common issues:**
   - 404: File not found
   - 500: Server error
   - 503: Service unavailable

### Step 3: Check for Common Issues

#### Issue: "Cannot read property X of undefined"
**Quick Fix:**
```typescript
// Add null/undefined check
if (!data) return <LoadingSpinner />
```

#### Issue: "DATABASE_URL is not defined"
**Quick Fix:**
```bash
# Check if .env.local exists with:
DATABASE_URL=your_database_url
SESSION_SECRET=your_secret

# Then restart dev server:
# Kill: Ctrl+C
# Restart: npm run dev
```

#### Issue: Hydration mismatch error
**Quick Fix:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

#### Issue: Module not found errors
**Quick Fix:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm run dev
```

---

## Debug with Console Logging

### Add Debug Logs (Recommended)
```typescript
// In components
'use client'

export function MyComponent() {
  console.log('[v0] Component mounted')
  console.log('[v0] Props received:', props)
  
  return <div>Content</div>
}

// In server actions
'use server'

export async function myAction(data) {
  console.log('[v0] Server action called with:', data)
  
  try {
    const result = await someOperation()
    console.log('[v0] Operation successful:', result)
    return result
  } catch (error) {
    console.error('[v0] Operation failed:', error)
    throw error
  }
}
```

### View Logs
- **Browser Console:** DevTools → Console tab
- **Server Console:** Terminal where `npm run dev` is running

---

## Debugging Tools Comparison

| Tool | Use For | Access |
|------|---------|--------|
| Console tab | JS errors, logging | F12 → Console |
| Network tab | API failures, slow requests | F12 → Network |
| Application tab | Cookies, localStorage, session | F12 → Application |
| DevTools React | Component tree, props, state | Extension required |
| VS Code Debugger | Step through code | Debug config needed |

---

## Quick Test Matrix

### Test These Scenarios
- [ ] Page loads (no blank screen)
- [ ] Can log in
- [ ] Can submit a question
- [ ] Can view questions
- [ ] Can answer questions
- [ ] Profile editing works
- [ ] Logout works
- [ ] Mobile responsive (resize window)

---

## Emergency Troubleshooting (5-minute fix)

```bash
# 1. Clear everything and restart
rm -rf .next node_modules
npm install

# 2. Reset database (if development)
# Clear your database and reseed if needed

# 3. Restart dev server
npm run dev

# 4. Clear browser cache
# DevTools → Application → Clear site data

# 5. Hard reload
Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

---

## Database Connection Issues

### Test Database Connection
```bash
# In project directory, create test.js:
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL)

sql`SELECT NOW()`.then(result => {
  console.log('✓ Database connected:', result)
}).catch(error => {
  console.error('✗ Database error:', error.message)
})

# Run it:
node test.js
```

---

## Performance Issues?

### Check Page Load Time
1. DevTools → Network tab
2. Look at "Total" size at bottom
3. Check which requests are slowest
4. Common causes:
   - Large images
   - Slow API responses
   - Unoptimized queries

### Quick Optimization
```typescript
// Use parallel requests instead of sequential
// Bad:
const data1 = await fetch('/api/data1')
const data2 = await fetch('/api/data2')

// Good:
const [data1, data2] = await Promise.all([
  fetch('/api/data1'),
  fetch('/api/data2')
])
```

---

## Test Your Fixes

After making changes, verify with:

```bash
# 1. Check for TypeScript errors
npm run build

# 2. Run tests
npm run test

# 3. Check formatting
npm run lint

# 4. Visual check
npm run dev
# Open browser and test manually
```

---

## Still Stuck?

### Provide This Info When Asking for Help
1. Exact error message from console
2. Screenshot of DevTools Network tab
3. Steps to reproduce
4. Browser and version
5. Your dev environment (`node -v`, `npm -v`)

### Check These Files
- `.env.local` - All required variables present?
- `app/layout.tsx` - All providers present?
- `package.json` - Dependencies installed?
- `jest.config.js` - Jest configured correctly?

---

## Restart Your Dev Server

```bash
# Kill current server
Ctrl+C

# Reinstall if needed
npm install

# Restart
npm run dev
```

Sometimes the simple fix is the right fix!
