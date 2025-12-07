# SmartCart - Grocery Shopping Agent Backend

A production-ready Express.js backend server for SmartCart, a grocery shopping agent deployed on BNB Chain testnet.

## Features

- ✅ Inventory Management (Persistent & Encrypted)
- ✅ ML Forecasting (Linear regression for run-out prediction)
- ✅ Transaction Approval & Risk Assessment
- ✅ Audit Logging & Compliance (Recoverable Logs)
- ✅ Live/Mock Shopping Integrations (Amazon & Walmart)
- ✅ Smart OCR inputs (Regex/NLP Parsing)
- ✅ Budget Management (Monthly Caps)
- ✅ Vendor Allowlist/Blocklist
- ✅ Privacy-First Architecture (AES-256 Encryption, On-Device DB)
- ✅ Comprehensive Test Suite (85 tests, 29% coverage)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan, Custom Logger

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=DEBUG
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:3001` by default.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## API Documentation

### Health Check

#### GET /api/health
Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-04T21:34:49.506Z",
  "uptime": "600s",
  "memory": {
    "rss": "41MB",
    "heapTotal": "10MB",
    "heapUsed": "8MB",
    "external": "2MB"
  }
}
```

### Inventory Management

#### POST /api/inventory
Add a new item to inventory.

**Request Body:**
```json
{
  "name": "Milk",
  "quantity": 2,
  "category": "dairy",
  "price": 3.99,
  "unit": "liters",
  "expiration_date": "2025-12-11T00:00:00.000Z"
}
```

**Response:** `201 Created`

#### GET /api/inventory
Get all inventory items.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...],
  "count": 2
}
```

#### GET /api/inventory/:id
Get a specific item by ID.

#### PUT /api/inventory/:id
Update an item.

**Request Body:**
```json
{
  "quantity": 5,
  "expiration_date": "2025-12-15T00:00:00.000Z"
}
```

#### DELETE /api/inventory/:id
Delete an item.

#### GET /api/inventory/expiring-soon?days=2
Get items expiring within specified days.

#### GET /api/inventory/by-category/:category
Filter items by category (produce, dairy, meat, pantry, frozen, other).

#### GET /api/inventory/total-value
Get total inventory value.

#### POST /api/inventory/import-receipt
Import items from receipt JSON.

**Request Body:**
```json
{
  "purchase_date": "2025-12-04T00:00:00.000Z",
  "items": [
    {
      "name": "Milk",
      "quantity": 2,
      "category": "dairy",
      "price": 3.99
    }
  ]
}
```

### Forecasting

#### GET /api/forecast/shopping-list
Get prioritized shopping list (urgent, soon, planned).

#### GET /api/forecast/item/:id
Predict run-out date for a specific item.

#### POST /api/forecast/record-usage
Record item usage.

**Request Body:**
```json
{
  "item_id": "item_1",
  "quantity_consumed": 0.5
}
```

#### GET /api/forecast/usage-history/:id
Get usage history for an item.

#### GET /api/forecast/recommended-quantity/:id?days=7
Get recommended purchase quantity.

### Transactions

#### POST /api/transactions/preview
Preview transaction with risk assessment.

**Request Body:**
```json
{
  "items": [
    {"name": "Milk", "quantity": 2, "unit_price": 3.99}
  ],
  "total_cost": 7.98,
  "vendor": "amazon",
  "budget_limit": 500
}
```

#### POST /api/transactions/create
Create a pending transaction.

#### POST /api/transactions/:id/approve
Approve a pending transaction.

**Request Body:**
```json
{
  "user_id": "user_123",
  "reason": "Within budget"
}
```

#### POST /api/transactions/:id/reject
Reject a pending transaction.

**Request Body:**
```json
{
  "user_id": "user_123",
  "reason": "Exceeds budget"
}
```

#### GET /api/transactions/pending
Get all pending transactions.

#### GET /api/transactions/history?limit=50&offset=0
Get transaction history.

#### GET /api/transactions/:id
Get transaction details.

### Shopping

#### GET /api/shopping/search?query=milk&limit=5
Search products across Amazon and Walmart.

#### GET /api/shopping/compare/:item
Compare prices for an item across vendors.

#### GET /api/shopping/amazon/search?query=milk
Search Amazon products.

#### GET /api/shopping/walmart/search?query=milk
Search Walmart products.

#### GET /api/shopping/amazon/:id
Get Amazon product details.

#### GET /api/shopping/walmart/:id
Get Walmart product details.

#### POST /api/shopping/build-cart
Build optimal cart across vendors.

**Request Body:**
```json
{
  "items": [
    {"name": "Milk", "quantity": 2},
    {"name": "Bread", "quantity": 1}
  ],
  "budget": 50
}
```

### Audit

#### GET /api/audit/log?action_type=ITEM_ADDED&limit=50
Get audit log with filters.

**Query Parameters:**
- `action_type`: Filter by action type
- `entity_type`: Filter by entity type
- `entity_id`: Filter by entity ID
- `user_id`: Filter by user ID
- `start_date`: Start date filter
- `end_date`: End date filter
- `limit`: Result limit
- `offset`: Result offset

#### GET /api/audit/report?start_date=2025-12-01&end_date=2025-12-31
Generate compliance report.

#### GET /api/audit/by-action/:action
Get audit log filtered by action type.

#### GET /api/audit/by-date?start_date=2025-12-01&end_date=2025-12-31
Get audit log filtered by date range.

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Project Structure

```
src/
├── controllers/       # Request handlers
├── middleware/        # Express middleware
├── models/           # Data models
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utilities
└── index.js          # Server entry point
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation and sanitization
- Error handling middleware

## License

ISC

## Author

SmartCart Development Team


