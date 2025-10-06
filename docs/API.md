## API Reference

Base URL: `http://localhost:3003/api/v1`

All responses follow a consistent envelope on success and error.

### Success Envelope
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong",
    "details": []
  },
  "meta": {
    "requestId": "N/A",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Wallet

#### GET /wallet/:userId
- **Description**: Get a wallet by `userId`.
- Query: none
- Response 200:
```json
{
  "statusCode": 200,
  "data": {
    "wallet_id": "uuid",
    "user_id": "uuid",
    "balance": "0",
    "currency": "USD",
    "status": "ACTIVE",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Success",
  "success": true
}
```

#### POST /wallet
- **Description**: Create a wallet.
- Body:
```json
{
  "user_id": "uuid",
  "initial_balance": 0,
  "currency": "USD"
}
```
- Response 201: created wallet in `data`.

#### PUT /wallet/:wallet_id/status
- **Description**: Update wallet status.
- Body:
```json
{ "status": "ACTIVE" }
```
- Allowed: `ACTIVE`, `FREEZE`, `CLOSE`

---

### Transactions

#### GET /wallet/:wallet_id/transactions
- **Description**: List transactions for a wallet with pagination and filters.
- Query params:
  - `page` (default 1)
  - `limit` (default 10)
  - `start_date`, `end_date` (ISO-8601)
  - `type` (e.g. CREDIT, DEBIT)
  - `status` (e.g. SUCCESS, PENDING, FAILED)
- Response 200:
```json
{
  "statusCode": 200,
  "data": {
    "transactions": [
      {
        "txn_id": "uuid",
        "amount": "100.00",
        "type": "CREDIT",
        "description": "...",
        "status": "SUCCESS",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1 }
  },
  "message": "Success",
  "success": true
}
```

#### POST /wallet/:wallet_id/transactions
- **Description**: Create a transaction for a wallet.
- Body:
```json
{
  "amount": 100.0,
  "type": "CREDIT",
  "description": "optional",
  "status": "PENDING",
  "metadata": {"source": "system"},
  "reference_id": "optional",
  "reference_type": "optional"
}
```
- Response 201: created transaction in `data`.

---

### Budget

#### GET /budget/:user_id
- **Description**: Get budgets for a `user_id` (by resolving the user's wallet first).
- Response 200: list of budgets in `data`.

#### POST /budget
- **Description**: Create a new budget.
- Body:
```json
{
  "wallet_id": "uuid",
  "total_amount": 1000,
  "period_type": "MONTHLY",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "created_by": "uuid"
}
```
- Response 201: created budget in `data`.

---

### Notes
- All endpoints are mounted under `/api/v1`.
- Add authentication and authorization as needed via middleware.

