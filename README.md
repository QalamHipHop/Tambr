# Tambr (RialToken) - Optimized Strategic Ecosystem

This repository contains the complete, optimized, and production-ready codebase for the Tambr (RialToken) project, a FinTech platform for tokenizing utility assets with Rial backing, based on the **Final Optimized Strategic Plan (Generation 3)**.

## Project Architecture

The project is structured as a **Monorepo** using `pnpm` workspaces to manage the following components:

| Component | Technology | Description |
| :--- | :--- | :--- |
| `packages/contracts` | **Solidity, Hardhat** | Core smart contracts: IRR-Stablecoin, Dynamic Bonding Curve (DBC), Smart Tickets (ERC-721 with Royalty), Soulbound Tokens (SBTs), and Governance Token (GT). |
| `packages/backend` | **NestJS, TypeScript** | Backend services: KYC/AML compliance, User/Wallet Management (Social Recovery Wallet logic), Oracle price feeds, and API Gateway. |
| `packages/relayer` | **NestJS, TypeScript** | Gasless Transaction Relayer service for paying gas fees on behalf of users (Meta-Transactions). |
| `packages/frontend` | **Next.js, TypeScript** | User-facing web application: Dashboard, DBC Buy/Sell interface, Social Recovery Wallet UI. |

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   pnpm (v8+)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/QalamHipHop/Tambr.git
    cd Tambr
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

### Running the Project

1.  **Start the Backend Services (KYC, Wallet, Oracle):**
    ```bash
    pnpm --filter @tambr/backend start:dev
    # Runs on http://localhost:3001
    ```
2.  **Start the Relayer Service (Mock):**
    ```bash
    pnpm --filter @tambr/relayer start:dev
    # Runs on http://localhost:3002
    ```
3.  **Start the Frontend Application:**
    ```bash
    pnpm --filter @tambr/frontend dev
    # Runs on http://localhost:3000
    ```

## Core Features Implemented

*   **Smart Contracts:** Initial structure for IRR-Stablecoin, Dynamic Bonding Curve (DBC) with Founder Fee logic, Smart Tickets (ERC-721/2981), SBTs, and Governance Token (GT).
*   **Backend:** Mock KYC Level 1 verification and Social Recovery Wallet creation/recovery APIs.
*   **Frontend:** Basic dashboard for wallet creation, mock KYC submission, and a placeholder for the Gasless DBC Buy/Sell interface.

## Data Storage

All platform data is stored in Git for transparency and version control. The `/data` directory contains:

*   **`/data/events`** - Event metadata and ticket information
*   **`/data/users`** - User profiles and account data
*   **`/data/transactions`** - Transaction records and blockchain confirmations

See `/data/README.md` for detailed information about data structure and management.

## Recent Improvements (Generation 4)

### Frontend Enhancements
*   **Fixed Critical Issues:**
    - Restored empty `layout.tsx` with proper Next.js structure
    - Restored empty `page.tsx` with complete homepage implementation
    - Added missing `providers.tsx` for Web3 integration (wagmi + RainbowKit)

*   **Configuration Files Added:**
    - `tsconfig.json` - TypeScript configuration
    - `next.config.js` - Next.js configuration
    - `tailwind.config.js` - Tailwind CSS configuration
    - `postcss.config.js` - PostCSS configuration
    - `.eslintrc.json` - ESLint configuration
    - `globals.css` - Global styles with Tailwind

*   **New Pages Implemented:**
    - Enhanced homepage with navigation, features, and user stats
    - Event creation page (`/create-event`) with form validation
    - Tickets management page (`/tickets`) with ticket display

*   **Dependencies Added:**
    - `@tanstack/react-query` - Data fetching and caching

### Data Storage Structure
*   Created Git-based data storage system for:
    - Events (with schema)
    - Users (with schema)
    - Transactions (with schema)
*   Added comprehensive documentation for data management

## Next Steps (Development Checklist)

1.  **Complete Smart Contract Logic:** Implement the full mathematical logic for the Dynamic Bonding Curve and deploy all contracts to a local Hardhat network.
2.  **Implement Relayer Service:** Finalize the logic in `packages/relayer` to sign and send meta-transactions.
3.  **Integrate Frontend with Contracts:** Use Ethers.js/Wagmi to connect the frontend directly to the deployed contracts via the Relayer service.
4.  **Backend Service:** Create backend APIs for event management, user profiles, and transaction tracking.
5.  **Data Persistence:** Implement automatic Git commits for data changes.
6.  **Comprehensive Testing:** Write unit tests for all smart contracts and backend services.
7.  **Deployment Configuration:** Add Dockerfiles and CI/CD configurations.
