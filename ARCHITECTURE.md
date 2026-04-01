# Authentication Architecture Diagram

## Component Structure

```
src/
├── main.tsx
│   └── <AuthProvider>
│       └── App.tsx
│           ├── Routes:
│           │   ├── /signup → Signup.tsx (role selection)
│           │   ├── /signup/seller → SellerSignup.tsx → SignupForm
│           │   ├── /signup/customer → CustomerSignup.tsx → SignupForm
│           │   ├── /signup/manager → ManagerSignup.tsx → SignupForm
│           │   ├── /verify-otp → VerifyOTP.tsx
│           │   ├── /signin → SignIn.tsx
│           │   └── Protected:
│           │       ├── /dashboard_customer → <ProtectedRoute role=CUSTOMER> → CustomerMain
│           │       ├── /dashboard_seller → <ProtectedRoute role=SELLER> → SellerDashboard
│           │       └── /manager → <ProtectedRoute role=MANAGER> → ManagerMain
│           │
│           └── Contexts:
│               └── AuthContext.tsx (global auth state)
│                   ├── useAuth() hook
│                   ├── user: User | null
│                   ├── isAuthenticated: boolean
│                   ├── isLoading: boolean
│                   └── Methods:
│                       ├── login()
│                       ├── register()
│                       ├── verifyOTP()
│                       ├── logout()
│                       └── refreshUser()
│
├── services/
│   └── authService.ts (API client)
│       ├── register(userData)
│       ├── sendOTP(email, purpose)
│       ├── verifyOTP(email, code, purpose)
│       ├── login(credentials)
│       ├── refresh()
│       ├── getMe()
│       ├── storeTokens(access, refresh)
│       ├── getAccessToken()
│       ├── getUserRole()
│       ├── isAuthenticated()
│       └── logout()
│
└── components/
    └── ProtectedRoute.tsx
        ├── Checks isAuthenticated
        ├── Validates role (if required)
        └── Redirects to /signin if not auth
```

---

## Data Flow

### Sign Up Flow
```
User fills form (email, password, name, role)
  ↓
SignupForm.handleSubmit()
  ↓
authService.register(userData)
  ├─ POST /api/v0/auth/register/
  └─ Store pending_email & pending_role in sessionStorage
  ↓
authService.sendOTP(email, "SIGNUP")
  ├─ POST /api/v0/auth/otp/send/
  └─ Get OTP challenge & expiry
  ↓
Navigate to /verify-otp
  ↓
User enters 6-digit OTP
  ↓
VerifyOTP.handleSubmit()
  ↓
authService.verifyOTP(email, code, "SIGNUP")
  ├─ POST /api/v0/auth/otp/verify/
  ├─ Receive access_token & refresh_token
  └─ Call storeTokens()
  ↓
AuthContext updates user state
  ↓
Navigate to role-specific dashboard
```

### Login Flow
```
User enters email & password
  ↓
SignIn.handleSubmit()
  ↓
authService.login(credentials)
  ├─ POST /api/v0/auth/login/
  ├─ Receive access_token, refresh_token, role
  └─ Call storeTokens()
  ↓
AuthContext.login() → getMe() → Update user state
  ↓
Navigate to dashboard based on role
```

### Protected Route Access
```
User navigates to /dashboard_seller
  ↓
ProtectedRoute component renders
  ↓
Check: authService.isAuthenticated()
  ├─ Get access_token from localStorage
  ├─ Decode token
  └─ Check if exp > currentTime
  ↓
  ├─ If false → Redirect to /signin
  ├─ If true and role mismatch → Redirect to /
  └─ If true and role matches → Render <SellerDashboard />
```

---

## Token Management

```
localStorage
├── access_token (JWT, 12h lifetime)
│   ├─ Used in Authorization header
│   ├─ Contains role claim
│   └─ Checked client-side for expiry
├── refresh_token (JWT, 14d lifetime)
│   └─ Used to get new access_token
├── user_role (string)
│   └─ Extracted from access_token
└── token_exp (number)
    └─ Expiry timestamp from token

On 401 response:
  ↓
authService.refresh()
  ├─ POST /api/v0/auth/refresh/ with refresh_token
  ├─ Get new access_token
  ├─ Update localStorage
  └─ Retry original request
```

---

## State Management

```
AuthContext
├── State:
│   ├── user: { id, email, role, is_active, date_joined } | null
│   └── isLoading: boolean
│
├── Init:
│   ├─ On mount: Check localStorage for token
│   ├─ If valid: Call getMe() to fetch user
│   └─ If invalid: logout()
│
├── Methods:
│   ├─ login(email, password)
│   │   ├─ authService.login()
│   │   ├─ authService.getMe()
│   │   └─ setUser()
│   │
│   ├─ register(email, password, name, role)
│   │   └─ authService.register()
│   │
│   ├─ verifyOTP(email, code)
│   │   ├─ authService.verifyOTP()
│   │   ├─ authService.getMe()
│   │   └─ setUser()
│   │
│   ├─ logout()
│   │   ├─ authService.logout()
│   │   └─ setUser(null)
│   │
│   └─ refreshUser()
│       ├─ authService.getMe()
│       └─ setUser()
│
└── useAuth() hook
    └─ Returns { user, isLoading, isAuthenticated, login, register, verifyOTP, logout, refreshUser }
```

---

## Error Handling

```
User Action
  ↓
API Call
  ↓
Response:
├─ 200/201: Success
│   └─ Process response, update state
│
├─ 400: Validation Error
│   ├─ Extract errorData.detail or errorData.reason
│   ├─ Throw error with message
│   └─ Display in UI
│
├─ 401: Unauthorized
│   ├─ Try to refresh token
│   ├─ If refresh succeeds: Retry request
│   └─ If refresh fails: logout() & redirect /signin
│
├─ 403: Forbidden (role mismatch)
│   ├─ Throw error
│   └─ ProtectedRoute redirects to /
│
├─ 429: Rate Limited
│   ├─ Extract cooldown_seconds
│   ├─ Throw error with countdown message
│   └─ Show remaining time in UI
│
└─ Other: Server Error
    ├─ Throw error
    └─ Display generic message
```

---

## API Integration

```
All requests:
├─ Base URL: VITE_API_BASE (env variable)
├─ Headers: Content-Type: application/json
└─ Headers: ngrok-skip-browser-warning: 69420

Protected requests:
└─ Headers: Authorization: Bearer <access_token>

Response handling:
├─ Success (200-299): Parse JSON
├─ Client error (400-499): Extract error.detail or error.reason
├─ Server error (500-599): Generic error message
└─ Network error: "Network error occurred"
```

---

## Security Measures

```
Registration:
├─ Email validation (RFC format)
└─ Password validation (8+ characters)

Login:
├─ Rate limiting (backend)
└─ Error messages don't reveal user existence

OTP:
├─ 6-digit code
├─ 10-minute expiry (backend)
├─ Resend cooldown (60s backend)
├─ Max attempts (5, backend)
└─ Can't verify without valid registration

Tokens:
├─ Access token: 12-hour lifetime
├─ Refresh token: 14-day lifetime
├─ Client-side expiry check
├─ Automatic refresh on 401
└─ Auto-logout on refresh failure

Routes:
├─ Unauthenticated access prevented
├─ Role validation enforced
└─ Wrong role redirects to /
```

---

## Testing Scenarios

```
Sign Up:
├─ Happy path: Complete flow works
├─ Invalid email: Show validation error
├─ Weak password: Show requirement error
├─ Passwords don't match: Show error
├─ Email exists: Show backend error
├─ OTP resend: Cooldown enforced
├─ Invalid OTP: Show error
├─ Expired OTP: Prompt to resend
└─ Successful verify: Redirect to dashboard

Login:
├─ Valid credentials: Works
├─ Invalid email: Show error
├─ Wrong password: Show error
├─ Inactivate user: Show error
└─ Successful: Redirect to correct dashboard

Protected Routes:
├─ Not logged in: Redirect /signin
├─ Logged in, correct role: Show page
├─ Logged in, wrong role: Redirect /
└─ Token expired: Auto-refresh + show page

Logout:
├─ Clear localStorage
├─ Redirect /signin
└─ Can't access dashboard
```

---

This architecture ensures:
✅ Secure authentication with OTP verification
✅ Clean separation of concerns
✅ Global state management
✅ Protected routes with role checking
✅ Comprehensive error handling
✅ Token lifecycle management
