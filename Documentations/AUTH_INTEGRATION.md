# AUTH_INTEGRATIONA.md

## 1. Purpose

Full frontend integration spec for authentication flow in NoThrowam backend.
Use this doc to build registration/login UX, token handling, OTP verification, and protected route behavior.

Base URL: `http://<HOST>/api/v0/auth/`

---

## 2. Authentication concepts

- JWT access/refresh via `rest_framework_simplejwt`.
- Registration creates user with `is_active=false`; requires OTP verification to finalize activation.
- OTP is email-based and also used for password reset/withdrawal (not fully implemented in UI yet).
- User roles: `CUSTOMER`, `MANAGER`, `SELLER`.
- Role-specific endpoints provided for test purposes.

---

## 3. Endpoints

### 3.1 `POST /api/v0/auth/register/`

Use to create account (customer/seller/manager).

Request body (JSON):
- `email` (required, valid email, case-insensitive unique)
- `password` (required, min 8 chars)
- `name` (optional)
- `role` (required): one of `CUSTOMER`, `MANAGER`, `SELLER`

Response 201:
- `{"detail": "User created. OTP sent.", "email": "..."}`

Errors 400 (validation):
- `email` already used
- invalid role
- weak password
- missing fields

Behavior:
- Creates user with `is_active=false`, `role`, email, username=email
- Creates `CustomerProfile` automatically if role = CUSTOMER
- Sends OTP (helper `send_otp_email_async`) for `purpose=SIGNUP`
- Invalidates prior non-used signup OTPs for that email.

### 3.2 `POST /api/v0/auth/login/`

Standard token pair login.

Request body (JSON):
- `email` (required)
- `password` (required)

Response 200:
- `{"refresh": "...", "access": "...", "role": "CUSTOMER|MANAGER|SELLER"}`

Errors 401:
- invalid credentials
- user inactive (if `is_active` false)

Use access token for protected API calls in header:
`Authorization: Bearer <access>`

### 3.3 `POST /api/v0/auth/refresh/`

Request body (JSON):
- `refresh` (required)

Response 200:
- `{"access": "..."}`

Errors 401:
- refresh invalid/expired

### 3.4 `GET /api/v0/auth/me/`

Requires auth header.

Response 200:
- `{"id": int, "email": string, "role": string, "is_active": bool, "date_joined": ISO8601}`

Errors 401:
- missing/invalid token

### 3.5 `GET /api/v0/auth/ping/manager/`

Protected route for `MANAGER` role only.

Response 200:
- `{"ok": true, "role": "MANAGER"}`

Errors 403: role mismatch
Errors 401: unauthorized

### 3.6 `GET /api/v0/auth/ping/seller/`

Protected for `SELLER`.

Response 200:
- `{"ok": true, "role": "SELLER"}`

---

## 4. OTP flow (signup and future reset flows)

### 4.1 `POST /api/v0/auth/otp/send/`

Request body (JSON):
- `email` (required)
- `purpose` (required): one of `SIGNUP`, `PASSWORD_RESET`, `WITHDRAWAL`

Response 201:
- `{"challenge_id": "<uuid>", "expires_at": "ISO8601", "cooldown_seconds": 60}`

Errors 400: invalid data
Errors 429: if resend within cooldown
- `{"detail":"resend_cooldown_active", "cooldown_seconds": int}`

Local OTP config from `core/settings.py`:
- `OTP_LENGTH = 6`
- `OTP_EXPIRY_SECONDS = 600` (10 min)
- `OTP_RESEND_COOLDOWN = 60` (1 min)
- `OTP_MAX_ATTEMPTS = 5`

### 4.2 `POST /api/v0/auth/otp/verify/`

Request body (JSON):
- `email` (required)
- `purpose` (required: same as above)
- `code` (required, string up to 6 chars)

Response 200 on success:
- for `purpose=SIGNUP`: returns fresh JWT tokens
  - `{"access":"...","refresh":"..."}`

Failure examples 400:
- `{"verified": false, "reason": "no_active_otp"}`
- `{"verified": false, "reason": "invalid_code"}`
- `{"verified": false, "reason": "max_attempts_reached"}`
- `{"verified": false, "reason": "expired"}`

Behavior on verified signup:
- sets user.is_active = True
- returns token pair (same shape as login)

---

## 5. Token lifetime values (from settings)

- `ACCESS_TOKEN_LIFETIME`: 12 hours
- `REFRESH_TOKEN_LIFETIME`: 14 days
- `ROTATE_REFRESH_TOKENS`: false

---

## 6. UI page flows

### 6.1 Register flow (preferred, robust)

1. User enters email, password, name (optional), role.
2. POST `/api/v0/auth/register/`.
3. If 201, show verification screen with OTP input and countdown (10 min).
4. (Option) call `/api/v0/auth/otp/send/` again for `purpose=SIGNUP` when user clicks resend; handle `429` with cooldown UI.
5. User enters OTP code.
6. POST `/api/v0/auth/otp/verify/`.
   - On 200: store both tokens in secure storage, set Auth state, navigate to dashboard.
   - On 400: show message for invalid/expired/attempts locked.

### 6.2 Login flow

1. User enters email/password.
2. POST `/api/v0/auth/login/`.
3. On 200: store `access` (in-memory + refresh token in httpOnly secure cookie if you have backend support; otherwise secure storage) + `refresh`, and user role.
4. On 401: show invalid credentials / user not activated.

### 6.3 Authenticated session

- For each protected request set `Authorization: Bearer <access>`.
- On 401 from any API, call `POST /api/v0/auth/refresh/` (with stored refresh token).
- If refresh returns 200, update access and retry original request.
- If refresh fails, force logout and go to login.

### 6.4 `me` endpoint for session bootstrapping

- After load, GET `/api/v0/auth/me/` to verify token and fetch role.
- If 401, drop session.

### 6.5 Role-based routing examples

- `MANAGER` can use `/api/v0/auth/ping/manager/`; `SELLER` can use `/api/v0/auth/ping/seller/`.
- Frontend should guard pages by `role` claim from login/verify token and/or `me` endpoint.

---

## 7. Complete values / enums

- roles: `CUSTOMER`, `MANAGER`, `SELLER`
- OTP purposes: `SIGNUP`, `PASSWORD_RESET`, `WITHDRAWAL`

---

## 8. Error and message catalog (recommended mapping)

- `400` validation errors: field-specific details, repeated fields.
- `401` unauthorized: use to refresh tokens or force login screen.
- `403` for role mismatch (ping endpoints).
- `429` cooldown in OTP send.

Sample OTP verify errors:
- `no_active_otp`, `invalid_code`, `expired`, `max_attempts_reached`, `already_used`

---

## 9. Notes for frontend / security recommendations

- Use HTTPS always.
- Avoid storing JWT in localStorage for XSS; prefer secure cookies or in-memory + refresh refresh token from secure store.
- Keep access token lifetime 12h and check expiry client-side (token decode `exp`).
- Logout: delete `access`/`refresh` and clear auth state.
- On signup branch, if discovery of existing user triggers `email already used`, offer login/forgot password.

---

## 10. Postman quick collection outline

1. `Register` (POST `/api/v0/auth/register/`)
2. `Send OTP` (POST `/api/v0/auth/otp/send/`)
3. `Verify OTP` (POST `/api/v0/auth/otp/verify/`)
4. `Login` (POST `/api/v0/auth/login/`)
5. `Refresh` (POST `/api/v0/auth/refresh/`)
6. `Me` (GET `/api/v0/auth/me/` + Bearer)
7. `Ping Manager` (GET `/api/v0/auth/ping/manager/` + Bearer)
8. `Ping Seller` (GET `/api/v0/auth/ping/seller/` + Bearer)
