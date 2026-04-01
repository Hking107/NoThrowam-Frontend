# NoThrowam Frontend Authentication Integration

## Overview

This document describes the cleanly integrated authentication flow for the NoThrowam frontend, which seamlessly connects with the backend auth API.

## Architecture

### 1. Auth Service (`src/services/authService.ts`)

The core service that handles all authentication-related API calls:

- **`register(userData)`**: Creates a new user and triggers OTP send
  - Stores pending email/role in sessionStorage for OTP flow
  
- **`sendOTP(email, purpose)`**: Sends OTP to email
  - `purpose`: "SIGNUP", "PASSWORD_RESET", or "WITHDRAWAL"
  - Handles rate limiting (429 cooldown)
  
- **`verifyOTP(email, code, purpose)`**: Verifies OTP and completes signup
  - For signup: stores tokens and clears pending session data
  - Returns JWT tokens
  
- **`login(credentials)`**: Email/password login
  - Returns access and refresh tokens
  - User role included in response
  
- **`refresh()`**: Refreshes access token using refresh token
  
- **`getMe()`**: Fetches current user info (requires auth)

- **Token Management**:
  - `storeTokens(accessToken, refreshToken)`: Stores in localStorage with decoded metadata
  - `isAuthenticated()`: Checks if token is valid and not expired
  - `getAccessToken()`: Retrieves current access token
  - `getUserRole()`: Retrieves stored user role
  - `logout()`: Clears all stored data

### 2. Auth Context (`src/contexts/AuthContext.tsx`)

Global state management for authentication:

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email, password) => Promise<any>;
  register: (email, password, name, role) => Promise<any>;
  verifyOTP: (email, code) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
```

- Wraps the entire app in `main.tsx`
- Auto-initializes auth state on app load
- Provides hooks via `useAuth()` for components

### 3. Protected Routes (`src/components/ProtectedRoute.tsx`)

Guards dashboard routes:

```typescript
<ProtectedRoute requiredRole="SELLER">
  <SellerDashboard />
</ProtectedRoute>
```

- Redirects unauthenticated users to `/signin`
- Redirects users to `/` if role doesn't match
- Shows loading state during auth check

## User Flows

### Sign Up Flow

1. User visits `/signup` (role selection)
2. Selects role → navigates to `/signup/seller|customer|manager`
3. Fills registration form (email, password, name)
4. Submit triggers:
   - `authService.register()` → sends user data to backend
   - `authService.sendOTP()` → sends OTP to email
   - Navigate to `/verify-otp`
5. User enters 6-digit OTP
6. Submit triggers:
   - `authService.verifyOTP()` → verifies OTP
   - Store tokens via `storeTokens()`
   - Navigate to role-specific dashboard

### Sign In Flow  

1. User visits `/signin`
2. Enters email and password
3. Submit triggers:
   - `authService.login()` → authenticates with backend
   - Store tokens via `storeTokens()`
   - Navigate to role-specific dashboard based on returned role

### Protected Access

1. User visits protected route (e.g., `/dashboard_seller`)
2. `ProtectedRoute` component checks:
   - Is token valid? (`isAuthenticated()`)
   - Does role match? (if `requiredRole` specified)
3. If valid: render dashboard
4. If not: redirect to `/signin`

## Token Management

### Storage Strategy

Tokens are stored in `localStorage` for persistence across browser sessions:

- `access_token`: JWT token used for API requests (12h lifetime)
- `refresh_token`: Used to obtain new access tokens (14d lifetime)
- `user_role`: Decoded from token for quick access
- `token_exp`: Token expiry timestamp

### Token Refresh

When API returns 401 (Unauthorized):

1. Call `authService.refresh()` with stored refresh token
2. Update access token in localStorage
3. Retry original request

This is currently handled manually in API calls but can be automated via an axios/fetch interceptor.

## API Integration

### Base URL

Set via `VITE_API_BASE` environment variable or defaults to `http://localhost:8000`

### Headers

All requests include:
```typescript
{
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "69420"  // For ngrok tunneling support
}
```

Protected requests include:
```typescript
"Authorization": "Bearer <access_token>"
```

## Error Handling

### Common Errors

| Status | Meaning | Handled By |
|--------|---------|-----------|
| 400 | Validation error | Service throws descriptive error |
| 401 | Unauthorized/Expired | Auto-logout, redirect to signin |
| 403 | Forbidden (role mismatch) | Service throws error |
| 429 | Rate limited (OTP) | Shows cooldown timer |

### Error Messages

User-facing messages are extracted from backend responses:

```typescript
error.message || error.detail || "Default message"
```

## Component Usage

### Using Auth Context in Components

```typescript
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.email}</div>;
}
```

## Security Considerations

1. **Token Storage**: Tokens stored in localStorage (vulnerable to XSS)
   - Consider secure cookie storage for production
   - Implement Content Security Policy (CSP)

2. **HTTPS Only**: Always use HTTPS in production

3. **Token Expiry**: Frontend decodes and checks token expiry before use

4. **Logout on Errors**: Any 401 response triggers automatic logout

5. **Session Validation**: `getMe()` can be called on app load to validate session

## Configuration

### Environment Variables

Create `.env`:

```
VITE_API_BASE=http://localhost:8000
```

### Backend Requirements

- OTP lifetime: 10 minutes
- Access token lifetime: 12 hours  
- Refresh token lifetime: 14 days
- OTP resend cooldown: 60 seconds
- Max OTP attempts: 5

## Testing the Flow

### 1. Test Sign Up

```bash
# Navigate to http://localhost:5173/signup
# Select role → Fill form → Receive OTP → Verify → Dashboard
```

### 2. Test Sign In

```bash
# Use credentials from signup
# http://localhost:5173/signin
```

### 3. Test Protected Routes

```bash
# Try accessing /dashboard_seller without logging in
# Should redirect to /signin
```

### 4. Test Token Refresh

```bash
# Wait for token to expire (12h)
# Service should auto-refresh with refresh token
```

## Future Enhancements

1. **Interceptor Middleware**: Auto-handle token refresh
2. **Secure Cookies**: Store refresh tokens in httpOnly cookies
3. **Remember Me**: Persistent login option
4. **2FA**: Two-factor authentication support
5. **Social Auth**: Google/GitHub login integration
6. **Logout from All Devices**: Invalidate all refresh tokens

## File Structure

```
src/
├── services/
│   └── authService.ts          # Core auth API client
├── contexts/
│   └── AuthContext.tsx         # Global auth state
├── components/
│   └── ProtectedRoute.tsx       # Protected route wrapper
└── pages/
    ├── SignIn.tsx              # Login page
    ├── Signup.tsx              # Role selection
    ├── SignupForm.tsx           # Signup form component
    ├── SellerSignup.tsx         # Seller-specific signup
    ├── CustomerSignup.tsx       # Customer-specific signup
    ├── ManagerSignup.tsx        # Manager-specific signup
    └── VerifyOTP.tsx            # OTP verification page
```

## Troubleshooting

### Issues

**Token not stored after login**
- Check browser are cookies/storage enabled
- Verify API returns tokens in response

**Redirect loop on protected routes**
- Check token validity: `localStorage.getItem('access_token')`
- Verify `getMe()` endpoint works with token

**OTP not received**
- Check email spam folder
- Verify backend OTP service configured
- Check API logs for errors

**401 errors after login**
- Token may be expired
- Call `authService.refresh()` to get new token
- Clear localStorage and re-login

---

For backend auth specs, see [AUTH_INTEGRATION.md](../Documentations/AUTH_INTEGRATION.md)
