# Tambr Regulatory Compliance Statement

**Disclaimer:** This document serves as a statement of intent and a placeholder for required regulatory disclosures. **Tambr is currently operating in a development and testing environment and does not hold any official licenses or approvals.**

## 1. Central Bank and Shaparak Licensing (Item #20)

**Status:** The Tambr project **does not** currently possess any official license, permit, or authorization from the Central Bank of Iran (CBI) or the Shaparak payment network for the issuance, operation, or redemption of the IRR Stablecoin.

**Future Intent:** Full regulatory compliance is a critical long-term goal. Before any mainnet deployment or public offering, the project intends to:
*   Seek legal counsel to determine the exact regulatory classification of the IRR Stablecoin under Iranian law.
*   Initiate the formal application process for any required licenses from the CBI or other relevant financial authorities.
*   Establish formal agreements with licensed payment service providers (PSPs) operating under the Shaparak network to facilitate fiat on/off-ramps.

## 2. KYC/AML Compliance (Item #4)

The platform is designed to integrate with KYC/AML services to comply with international and local financial regulations.
*   **Current State:** The smart contracts contain a `MockKYC` for development purposes.
*   **Production Plan:** Integration with a certified Iranian KYC service provider or an international provider like Onfido/SumSub will be implemented before launch.

## 3. Proof of Reserves (Item #17)

The IRR Stablecoin aims for full 1:1 backing by fiat IRR reserves.
*   **Current State:** The `IRRStablecoin` contract includes a `totalFiatReserves` variable and a `collateralizationRatio` function as a placeholder for transparency.
*   **Production Plan:** A transparent, real-time Proof of Reserves mechanism will be implemented, likely involving:
    *   Regular, independent audits of the fiat reserve accounts.
    *   Integration with a trusted third-party attestation service.

---
**CRITICAL WARNING:** Users should be aware that the lack of official licensing means the project operates at a high regulatory risk. Use of the platform is at the user's own risk.
