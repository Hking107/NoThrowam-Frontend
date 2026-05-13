# Payment Frontend Integration Guide

This guide covers the frontend flow for customer payments and seller withdrawals in the current backend.

Base API path: `/api/v0/payments/`
Frontend behavior:

* Disable the pay button after the first submit to avoid duplicate requests.
* Show a pending state after a successful initiation.
* The user confirms the payment on their phone in the mobile money prompt.

### Step 2: Open the seller websocket

The backend checks AangaraaPay itself and pushes payment updates over websocket. The frontend should not poll for status.

Connect to:

`wss://<api-host>/ws/payments/seller/<seller_id>/?token=<JWT_ACCESS_TOKEN>`

Example:

```text
wss://api.example.com/ws/payments/seller/42/?token=<JWT_ACCESS_TOKEN>
```

Initial server message:

```json
{
  "type": "payments_list",
  "seller_id": 42,
  "payments": []
}
```

Server events:

* `payments_list` - sent once on connect with the seller's current payment history
* `payment.updated` - sent whenever a payment changes status after the backend checks AangaraaPay or receives a webhook

Frontend behavior:

* Open the websocket when the seller dashboard loads.
* Render the payment list from the initial `payments_list` message.
* Update the matching payment row when `payment.updated` arrives.
* Show `PENDING`, `SUCCESSFUL`, and `FAILED` directly from websocket events.

### Step 3: Retrieve seller payment history

Use this endpoint to recover payment ids after reload or to preload the seller dashboard.

`GET /api/v0/payments/seller/<seller_id>/payments/`

Success response:

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "post": 1,
      "customer": 12,
      "transaction_id": "3f8b7d2c-0d0a-4c0c-8c9a-5d4b4c8e3a19",
      "amount": "1000.00",
      "commission": "50.00",
      "seller_credit": "950.00",
      "status": "SUCCESSFUL",
      "created_at": "2026-05-01T10:00:00Z",
      "updated_at": "2026-05-01T10:00:00Z"
    }
  ]
}
```

Frontend behavior:

* Use this route to get payment ids for a seller dashboard.
* If the websocket reconnects, reload the list from this route and resume listening for `payment.updated` events.
* Use the payment ids from this route to render detail views or receipts.

### Step 4: Handle asynchronous updates

The backend also receives provider callbacks at:

`POST /api/v0/payments/webhook/`

This endpoint is for the payment provider, not for direct browser use.

The frontend should not call it directly. The websocket stream is the source of truth for status changes.

**List all payments:**

`GET /api/v0/payments/list/`

Success response:

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "post": 1,
      "customer": 12,
      "transaction_id": "3f8b7d2c-0d0a-4c0c-8c9a-5d4b4c8e3a19",
      "amount": "1000.00",
      "commission": "50.00",
      "seller_credit": "950.00",
      "status": "SUCCESSFUL",
      "created_at": "2026-05-01T10:00:00Z",
      "updated_at": "2026-05-01T10:00:00Z"
    }
  ]
}
```

**Retrieve a specific payment:**

`GET /api/v0/payments/<payment_id>/`

Success response:

```json
{
  "id": 1,
  "post": 1,
  "customer": 12,
  "transaction_id": "3f8b7d2c-0d0a-4c0c-8c9a-5d4b4c8e3a19",
  "amount": "1000.00",
  "commission": "50.00",
  "seller_credit": "950.00",
  "status": "SUCCESSFUL",
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-05-01T10:00:00Z"
}
```

Frontend behavior:

* After page reload, call `GET /api/v0/payments/list/` to find the most recent pending payment
* Or use the stored `payment_id` with `GET /api/v0/payments/<payment_id>/` to directly retrieve a specific payment
* Use the payment ID from either endpoint for subsequent verify calls

### Step 4: Handle asynchronous updates

The backend also receives provider callbacks at:

`POST /api/v0/payments/webhook/`

This endpoint is for the payment provider, not for direct browser use.

The frontend should not call it directly. Use the verify or retrieve endpoints to refresh the UI state.

## 3. Seller Withdrawal Flow

Only seller accounts can use withdrawal endpoints.

### Step 1: Request a withdrawal challenge

Call:

`POST /api/v0/payments/withdrawals/initiate/`

Request body:

```json
{
  "amount": "5000.00",
  "phone_number": "237670123456",
  "operator": "Orange_Cameroon"
}
```

Success response:

```json
{
  "detail": "OTP sent to your email. Please confirm your withdrawal.",
  "challenge_id": "9eef8b3f-f325-4c71-a0a0-becfefaf67ef",
  "withdrawal_id": "2d9b0fa6-cd5e-4f61-8f60-5f3a7e8b6d5f",
  "amount": "5000.00",
  "operator": "Orange_Cameroon"
}
```

Frontend behavior:

* Show the OTP step after this call succeeds.
* Tell the seller to check email for the withdrawal OTP.
* If the backend returns insufficient balance, show the `available_balance` field.

### Step 2: Confirm the withdrawal

Call:

`POST /api/v0/payments/withdrawals/confirm/`

Request body:

```json
{
  "challenge_id": "9eef8b3f-f325-4c71-a0a0-becfefaf67ef",
  "otp_code": "123456"
}
```

Successful response:

```json
{
  "detail": "Withdrawal successful.",
  "amount": "5000.00",
  "operator": "Orange_Cameroon",
  "reference_id": "abc123def456",
  "new_balance": "45000.00"
}
```

Accepted but still processing:

```json
{
  "detail": "Withdrawal request accepted and is processing.",
  "amount": "5000.00",
  "operator": "Orange_Cameroon",
  "reference_id": "wd_12345",
  "provider_response": {}
}
```

Frontend behavior:

* On `200 OK`, show the withdrawal as completed.
* On `202 Accepted`, keep the withdrawal in a processing state and poll or refresh later if your UI supports it.
* On provider failure, show the error and allow the seller to retry later.

## 4. Error Handling

Recommended frontend handling:

* `400` - validation or business rule error; show the backend message to the user.
* `401` - session expired or missing token; redirect to login.
* `403` - role not allowed; hide or disable the feature for that user.
* `500` - configuration error; show a generic support message.
* `502` - provider error; tell the user to retry later.

Common backend validation cases:

* payment already exists for the same customer and post
* post already paid
* insufficient seller balance
* invalid OTP
* OTP expired or already used

## 5. Practical Frontend Sequence

### Seller dashboard

1. Seller opens the dashboard.
2. Frontend calls `GET /api/v0/payments/seller/<seller_id>/payments/`.
3. Frontend opens `ws/payments/seller/<seller_id>/` with the JWT token.
4. Render the `payments_list` payload.
5. Update rows in real time when `payment.updated` arrives.

### Payment creation

1. Customer clicks Pay.
2. Frontend calls `POST /api/v0/payments/initiate/`.
3. Store the returned `payment_id` locally for the current session.
4. The payment appears in the seller dashboard list.
5. The backend keeps checking AangaraaPay and pushes the final status through websocket.

### Seller withdrawal

1. Seller enters amount, phone number, and operator.
2. Frontend calls `POST /api/v0/payments/withdrawals/initiate/`.
3. Store the returned `challenge_id` for the next step.
4. UI shows OTP step.
5. Seller enters OTP.
6. Frontend calls `POST /api/v0/payments/withdrawals/confirm/` with the challenge_id.
7. UI shows completed or processing state depending on the response.

## 6. Notes For Integration

* Do not call the provider directly from the browser. The backend owns provider credentials, return URLs, and webhook handling.
* Use the websocket stream as the source of truth for payment status.
* The payment initiation response does not expose the provider pay token to the frontend.
* Repeated payment submits for the same customer and post are intentionally deduplicated by the backend.
