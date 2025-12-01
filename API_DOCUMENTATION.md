# Tambr API Documentation

Complete API reference for the Tambr backend services.

## Base URL

```
http://localhost:3001
```

## Authentication

Currently, the API uses no authentication. In production, JWT authentication will be implemented.

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "timestamp": "2025-11-29T12:00:00Z"
}
```

## Error Handling

Error responses include:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-11-29T12:00:00Z"
}
```

---

## KYC Module

### Submit KYC Level 1

Submit user identity verification information.

**Endpoint**: `POST /kyc/submit`

**Request Body**:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "phoneNumber": "09123456789",
  "nationalId": "0123456789"
}
```

**Response**:
```json
{
  "id": "uuid",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "phoneNumber": "09123456789",
  "status": "approved",
  "kycLevel": 1,
  "createdAt": "2025-11-29T12:00:00Z"
}
```

**Status Codes**:
- `201`: KYC submitted successfully
- `400`: Invalid input
- `409`: KYC already exists

---

### Get KYC Status

Retrieve KYC verification status for a wallet.

**Endpoint**: `GET /kyc/status/:walletAddress`

**Parameters**:
- `walletAddress` (string, required): Ethereum wallet address

**Response**:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "status": "approved",
  "kycLevel": 1
}
```

---

### Check KYC Approval

Check if a wallet has passed KYC verification.

**Endpoint**: `GET /kyc/check/:walletAddress`

**Parameters**:
- `walletAddress` (string, required): Ethereum wallet address

**Response**:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "isApproved": true
}
```

---

## Wallet Module

### Create Wallet

Create a new wallet with Social Recovery setup.

**Endpoint**: `POST /wallet/create`

**Request Body**:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "ownerName": "John Doe",
  "guardians": [
    "0x1234567890123456789012345678901234567890",
    "0x0987654321098765432109876543210987654321"
  ],
  "recoveryThreshold": 2
}
```

**Response**:
```json
{
  "id": "uuid",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "ownerName": "John Doe",
  "status": "active",
  "guardians": ["0x1234...", "0x0987..."],
  "recoveryThreshold": 2,
  "createdAt": "2025-11-29T12:00:00Z"
}
```

---

### Get Wallet Information

Retrieve wallet details.

**Endpoint**: `GET /wallet/:walletAddress`

**Parameters**:
- `walletAddress` (string, required): Ethereum wallet address

**Response**:
```json
{
  "id": "uuid",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "ownerName": "John Doe",
  "status": "active",
  "guardians": ["0x1234...", "0x0987..."],
  "recoveryThreshold": 2,
  "createdAt": "2025-11-29T12:00:00Z"
}
```

---

### Add Guardian

Add a guardian to a wallet's Social Recovery setup.

**Endpoint**: `POST /wallet/:walletAddress/guardian`

**Parameters**:
- `walletAddress` (string, required): Ethereum wallet address

**Request Body**:
```json
{
  "guardianAddress": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
}
```

**Response**:
```json
{
  "id": "uuid",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "guardians": ["0x1234...", "0x0987...", "0xabcd..."],
  "recoveryThreshold": 2
}
```

---

### Get Guardians

List all guardians for a wallet.

**Endpoint**: `GET /wallet/:walletAddress/guardians`

**Parameters**:
- `walletAddress` (string, required): Ethereum wallet address

**Response**:
```json
[
  "0x1234567890123456789012345678901234567890",
  "0x0987654321098765432109876543210987654321",
  "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
]
```

---

### Initiate Recovery

Start the wallet recovery process.

**Endpoint**: `POST /wallet/:walletAddress/recovery/initiate`

**Parameters**:
- `walletAddress` (string, required): Ethereum wallet address

**Request Body**:
```json
{
  "newOwnerAddress": "0xnewownerabcdefabcdefabcdefabcdefabcdefab"
}
```

**Response**:
```json
{
  "recoveryHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

---

### Complete Recovery

Finalize wallet recovery with guardian signatures.

**Endpoint**: `POST /wallet/:walletAddress/recovery/complete`

**Parameters**:
- `walletAddress` (string, required): Ethereum wallet address

**Request Body**:
```json
{
  "recoveryHash": "0x1234567890abcdef...",
  "guardianSignatures": [
    "0xsignature1...",
    "0xsignature2..."
  ]
}
```

**Response**:
```json
{
  "id": "uuid",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "status": "recovered"
}
```

---

## Oracle Module

### Get IRR/USD Price

Retrieve current Iranian Rial to USD exchange rate.

**Endpoint**: `GET /oracle/price/irr-usd`

**Response**:
```json
{
  "pair": "IRR/USD",
  "price": 42000,
  "timestamp": "2025-11-29T12:00:00Z"
}
```

---

### Get Token Price

Retrieve current price of a token in IRR.

**Endpoint**: `GET /oracle/price/:tokenAddress`

**Parameters**:
- `tokenAddress` (string, required): Token contract address

**Response**:
```json
{
  "tokenAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "price": 1000,
  "currency": "IRR",
  "timestamp": "2025-11-29T12:00:00Z"
}
```

---

### Get Market Cap

Retrieve market capitalization of a token.

**Endpoint**: `GET /oracle/market-cap/:tokenAddress`

**Parameters**:
- `tokenAddress` (string, required): Token contract address

**Response**:
```json
{
  "tokenAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "marketCap": 1000000,
  "currency": "IRR",
  "timestamp": "2025-11-29T12:00:00Z"
}
```

---

### Get Bonding Curve Progress

Retrieve bonding curve progress for a token.

**Endpoint**: `GET /oracle/bonding-curve/:tokenAddress`

**Parameters**:
- `tokenAddress` (string, required): Token contract address

**Response**:
```json
{
  "tokenAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "progress": 50,
  "percentage": "50%",
  "timestamp": "2025-11-29T12:00:00Z"
}
```

---

## Token Module

### Register Token

Register a new token in the system.

**Endpoint**: `POST /tokens/register`

**Request Body**:
```json
{
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "name": "My Token",
  "symbol": "MTK",
  "description": "A great token",
  "imageUrl": "https://example.com/token.png",
  "creatorAddress": "0xcreatoraddress..."
}
```

**Response**:
```json
{
  "id": "uuid",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "name": "My Token",
  "symbol": "MTK",
  "status": "bonding_curve",
  "marketCap": 0,
  "currentPrice": 0,
  "createdAt": "2025-11-29T12:00:00Z"
}
```

---

### Get Token Information

Retrieve token details.

**Endpoint**: `GET /tokens/:contractAddress`

**Parameters**:
- `contractAddress` (string, required): Token contract address

**Response**:
```json
{
  "id": "uuid",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "name": "My Token",
  "symbol": "MTK",
  "description": "A great token",
  "status": "bonding_curve",
  "marketCap": 50000,
  "currentPrice": 1500,
  "bondingCurveProgress": 45,
  "createdAt": "2025-11-29T12:00:00Z"
}
```

---

### List Active Bonding Curve Tokens

Get all tokens currently on bonding curve.

**Endpoint**: `GET /tokens`

**Response**:
```json
[
  {
    "id": "uuid",
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
    "name": "My Token",
    "symbol": "MTK",
    "status": "bonding_curve",
    "marketCap": 50000,
    "currentPrice": 1500,
    "bondingCurveProgress": 45,
    "createdAt": "2025-11-29T12:00:00Z"
  }
]
```

---

### List Migrated Tokens

Get all tokens that have migrated to AMM.

**Endpoint**: `GET /tokens/migrated/list`

**Response**:
```json
[
  {
    "id": "uuid",
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
    "name": "My Token",
    "symbol": "MTK",
    "status": "migrated",
    "ammAddress": "0xammaddress...",
    "createdAt": "2025-11-29T12:00:00Z"
  }
]
```

---

### Get Top Tokens

Get top tokens by market cap.

**Endpoint**: `GET /tokens/top/list?limit=10`

**Query Parameters**:
- `limit` (number, optional): Number of tokens to return (default: 10)

**Response**:
```json
[
  {
    "id": "uuid",
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
    "name": "My Token",
    "symbol": "MTK",
    "marketCap": 500000,
    "currentPrice": 5000,
    "bondingCurveProgress": 75
  }
]
```

---

### Search Tokens

Search tokens by name or symbol.

**Endpoint**: `GET /tokens/search/query?q=search`

**Query Parameters**:
- `q` (string, required): Search query

**Response**:
```json
[
  {
    "id": "uuid",
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
    "name": "My Token",
    "symbol": "MTK",
    "marketCap": 50000,
    "currentPrice": 1500
  }
]
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Default**: 100 requests per minute per IP
- **KYC Endpoints**: 10 requests per minute per IP
- **Trading Endpoints**: 50 requests per minute per IP

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

---

## Webhooks

Webhooks are available for real-time updates:

### Token Created
```json
{
  "event": "token.created",
  "data": {
    "contractAddress": "0x...",
    "name": "Token Name",
    "symbol": "TKN"
  }
}
```

### Token Migrated
```json
{
  "event": "token.migrated",
  "data": {
    "contractAddress": "0x...",
    "ammAddress": "0x..."
  }
}
```

### KYC Approved
```json
{
  "event": "kyc.approved",
  "data": {
    "walletAddress": "0x...",
    "kycLevel": 1
  }
}
```

---

## Examples

### Example: Create Token and Trade

```bash
# 1. Submit KYC
curl -X POST http://localhost:3001/kyc/submit \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
    "phoneNumber": "09123456789",
    "nationalId": "0123456789"
  }'

# 2. Create Wallet
curl -X POST http://localhost:3001/wallet/create \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
    "ownerName": "John Doe",
    "guardians": [],
    "recoveryThreshold": 0
  }'

# 3. Register Token
curl -X POST http://localhost:3001/tokens/register \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "0x...",
    "name": "My Token",
    "symbol": "MTK",
    "description": "A great token",
    "creatorAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
  }'

# 4. Get Token Price
curl http://localhost:3001/oracle/price/0x...

# 5. Get Bonding Curve Progress
curl http://localhost:3001/oracle/bonding-curve/0x...
```

---

## Support

For API issues or questions, please:

1. Check this documentation
2. Review error messages
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated**: November 29, 2025
