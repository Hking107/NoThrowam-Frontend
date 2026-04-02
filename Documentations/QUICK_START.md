# Quick Start Guide - Authentication

## For Developers

### Use Auth in Your Components

```typescript
import { useAuth } from "../contexts/AuthContext";

// In your component:
const { user, isAuthenticated, logout } = useAuth();

// Access user data
if (user) {
  console.log(user.email, user.role, user.is_active);
}
```

### Protect a Page

```typescript
import { ProtectedRoute } from "../components/ProtectedRoute";

// In App.tsx routes:
<ProtectedRoute requiredRole="SELLER">
  <SellerDashboard />
</ProtectedRoute>
```

### Make Authenticated API Calls

```typescript
const token = localStorage.getItem("access_token");
const response = await fetch("/api/v0/endpoint", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

### Handle 401 Errors

```typescript
try {
  const response = await fetch("/api/v0/endpoint", {
    headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
  });
  
  if (response.status === 401) {
    // Auto-handled by service, but you can refresh manually:
    await authService.refresh();
  }
} catch (error) {
  // Auth error handling
}
```

---

## For End Users

### Sign Up
1. Go to http://localhost:5173/signup
2. Choose your role (Seller/Customer/Manager)
3. Fill in email, password, optional name
4. Check your email for 6-digit code
5. Enter code on verification page
6. You're in! 🎉

### Sign In
1. Go to http://localhost:5173/signin
2. Enter email and password
3. You're in! 🎉

### Troubleshooting
- **No OTP email?** Check spam folder and wait 60 seconds before resending
- **Can't access dashboard?** Make sure you logged in
- **Wrong role selected?** Create new account with correct role
- **Forgot password?** (Coming soon with password reset flow)

---

## Environment Setup

Create `.env` file:
```
VITE_API_BASE=http://localhost:8000
```

For production:
```
VITE_API_BASE=https://api.example.com
```

---

## Testing the Integration

### Test Signup
```bash
curl -X POST http://localhost:8000/api/v0/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "role": "SELLER",
    "name": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/v0/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### Test OTP Verify
```bash
curl -X POST http://localhost:8000/api/v0/auth/otp/verify/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456",
    "purpose": "SIGNUP"
  }'
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Token stored but page redirects | Token might be expired. Check `token_exp` in localStorage |
| OTP never arrives | Check spam folder, verify backend email config |
| "Invalid credentials" on login | Email is case-sensitive, ensure email/password correct |
| Stuck in loading state | Check network tab for API errors, verify API_BASE URL |
| Can't access customer dashboard as seller | Role is checked. Sign up with correct role |

---

## File Reference

| Need to... | See file... |
|-----------|-----------|
| Modify auth logic | `src/services/authService.ts` |
| Access user state | `src/contexts/AuthContext.tsx` |
| Change protected routes | `src/App.tsx` |
| Update signup form | `src/pages/SignupForm.tsx` |
| Update login page | `src/pages/SignIn.tsx` |
| Change OTP flow | `src/pages/VerifyOTP.tsx` |

---

## API Endpoints Used

- `POST /api/v0/auth/register/` - Create account
- `POST /api/v0/auth/otp/send/` - Send OTP
- `POST /api/v0/auth/otp/verify/` - Verify OTP
- `POST /api/v0/auth/login/` - Login
- `POST /api/v0/auth/refresh/` - Refresh token
- `GET /api/v0/auth/me/` - Get current user

See `Documentations/AUTH_INTEGRATION.md` for full spec.

---

## Git Branch Info

Created on: `OTP_UX` branch

When ready to merge:
```bash
git add .
git commit -m "feat: Implement complete OTP-based authentication flow"
git push origin OTP_UX
```

Then create PR to main branch.
