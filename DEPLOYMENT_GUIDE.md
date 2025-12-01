# Tambr Deployment Guide

This guide provides step-by-step instructions for deploying the Tambr platform to different environments.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Testnet Deployment](#testnet-deployment)
3. [Mainnet Deployment](#mainnet-deployment)
4. [Verification Checklist](#verification-checklist)

## Local Development Setup

### Prerequisites

- Node.js v18+
- pnpm v8+
- PostgreSQL 14+
- Git

### Step 1: Clone and Install

```bash
git clone https://github.com/QalamHipHop/Tambr.git
cd Tambr
pnpm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Network
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tambr

# Founder Address (IMPORTANT!)
FOUNDER_ADDRESS=0xYourAddressHere

# Private Key for deployment
PRIVATE_KEY=0xYourPrivateKeyHere
```

### Step 3: Start PostgreSQL

```bash
# Using Docker
docker run --name tambr-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tambr \
  -p 5432:5432 \
  -d postgres:14

# Or using local PostgreSQL
createdb tambr
```

### Step 4: Start Local Blockchain

```bash
cd packages/contracts
pnpm node
```

This will start a Hardhat local network on `http://localhost:8545`

### Step 5: Deploy Smart Contracts

In a new terminal:

```bash
cd packages/contracts
pnpm deploy:local
```

This will:
- Compile all contracts
- Deploy to local network
- Save addresses to `deployment-addresses.json`
- Output deployment summary

**Important**: Copy the contract addresses from the output and update your `.env` file:

```env
NEXT_PUBLIC_IRR_STABLECOIN=0x...
NEXT_PUBLIC_GOVERNANCE_TOKEN=0x...
NEXT_PUBLIC_SMART_TICKET=0x...
NEXT_PUBLIC_SOULBOUND_TOKEN=0x...
```

### Step 6: Start Backend API

In a new terminal:

```bash
cd packages/backend
pnpm start:dev
```

The API will be available at `http://localhost:3001`

### Step 7: Start Frontend

In a new terminal:

```bash
cd packages/frontend
pnpm dev
```

The frontend will be available at `http://localhost:3000`

### Step 8: Verify Deployment

1. Open http://localhost:3000 in your browser
2. Connect your wallet (use Hardhat's default accounts)
3. Test KYC submission
4. Test token creation and trading

## Testnet Deployment

### Prerequisites

- Testnet RPC URL (e.g., Sepolia, Mumbai)
- Testnet ETH/MATIC for gas fees
- Testnet faucet access

### Step 1: Configure Testnet

Edit `packages/contracts/hardhat.config.ts`:

```typescript
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
  },
}
```

### Step 2: Update Environment

```env
# Network
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Deployment
PRIVATE_KEY=0xYourPrivateKeyHere
```

### Step 3: Deploy to Testnet

```bash
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network sepolia
```

### Step 4: Verify Contracts (Optional)

```bash
pnpm hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Step 5: Update Frontend

Update `.env` with testnet contract addresses:

```env
NEXT_PUBLIC_IRR_STABLECOIN=0x...
NEXT_PUBLIC_GOVERNANCE_TOKEN=0x...
# ... other addresses
```

### Step 6: Deploy Backend

```bash
# Update database connection for testnet
# Deploy to your server
cd packages/backend
pnpm build
# Copy to server and start
```

### Step 7: Deploy Frontend

```bash
cd packages/frontend
pnpm build
# Deploy to Vercel, Netlify, or your server
```

## Mainnet Deployment

### ⚠️ Critical Security Checklist

- [ ] All smart contracts audited by professional firm
- [ ] Private keys stored in secure vault (not in .env)
- [ ] Database backups configured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and alerting set up
- [ ] Disaster recovery plan documented

### Step 1: Security Audit

Before mainnet deployment, ensure:

1. **Smart Contract Audit**
   - Hire professional auditor (e.g., OpenZeppelin, Trail of Bits)
   - Fix all critical and high-severity issues
   - Document audit report

2. **Code Review**
   - Peer review all code changes
   - Security testing completed
   - Performance testing completed

### Step 2: Mainnet Configuration

```env
# Network
NEXT_PUBLIC_CHAIN_ID=1  # Ethereum mainnet
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Security
NODE_ENV=production
JWT_SECRET=<use strong random string>
CORS_ORIGIN=https://yourdomain.com

# Database
DB_HOST=<secure database host>
DB_USER=<strong username>
DB_PASSWORD=<strong password>

# Founder
FOUNDER_ADDRESS=<verified address>
```

### Step 3: Deploy Smart Contracts

```bash
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network mainnet
```

**Save the deployment addresses securely!**

### Step 4: Deploy Backend

```bash
# Build
cd packages/backend
pnpm build

# Deploy to production server
# (e.g., AWS, Google Cloud, DigitalOcean)
# Ensure database is backed up
# Enable monitoring and logging
```

### Step 5: Deploy Frontend

```bash
cd packages/frontend
pnpm build

# Deploy to CDN (Vercel, Netlify, AWS CloudFront)
# Enable caching and compression
```

### Step 6: Post-Deployment Verification

1. **Smart Contracts**
   - Verify all contracts on block explorer
   - Check founder allocation in GovernanceToken
   - Verify fee collection mechanism

2. **Backend**
   - Test all API endpoints
   - Verify database connectivity
   - Check logging and monitoring

3. **Frontend**
   - Test token creation flow
   - Test trading interface
   - Test KYC submission
   - Test wallet recovery

### Step 7: Monitoring & Maintenance

```bash
# Set up monitoring
# - Contract interactions
# - API performance
# - Database health
# - Transaction failures

# Regular maintenance
# - Database backups (daily)
# - Log rotation
# - Security updates
# - Performance optimization
```

## Verification Checklist

### Pre-Deployment

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] Smart contracts compiled without errors
- [ ] Tests passing (contracts, backend, frontend)
- [ ] No console errors or warnings

### Post-Deployment

- [ ] Smart contracts deployed successfully
- [ ] Contract addresses saved securely
- [ ] Backend API responding to requests
- [ ] Frontend loads without errors
- [ ] KYC module working
- [ ] Wallet creation working
- [ ] Token creation working
- [ ] Trading interface functional
- [ ] Founder fee collection verified
- [ ] Monitoring and alerting active

### Security Verification

- [ ] Private keys not exposed
- [ ] Database credentials secure
- [ ] API endpoints protected
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SSL/TLS active
- [ ] Audit logs enabled
- [ ] Backup strategy verified

## Troubleshooting

### Contract Deployment Fails

```bash
# Check gas price
pnpm hardhat run scripts/deploy.ts --network mainnet --gas-price 50

# Check account balance
pnpm hardhat accounts --network mainnet

# Check RPC connection
curl -X POST https://your-rpc-url \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Backend Connection Issues

```bash
# Check database connection
psql -h localhost -U postgres -d tambr

# Check API health
curl http://localhost:3001/health

# Check logs
tail -f logs/backend.log
```

### Frontend Not Loading

```bash
# Clear cache
rm -rf .next
pnpm build

# Check environment variables
cat .env | grep NEXT_PUBLIC

# Check browser console for errors
```

## Support

For deployment issues, please:

1. Check the logs
2. Review this guide
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated**: November 29, 2025
