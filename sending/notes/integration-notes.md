# Integration Notes

## Product Summary

This project is an MVP for medical crowdfunding on-chain.

Main idea:

- hospitals create verified campaigns
- donors fund in USDC
- donors vote on milestone releases
- unused funds are intended to earn yield
- a backend can score uploaded medical documents for fraud risk

## Frontend Flow

1. User opens the app.
2. User connects wallet from the dashboard.
3. Wallet is expected to be on `Polygon Amoy`.
4. Frontend reads:
   - `totalRaised`
   - `totalFundingGoal`
   - `donations(address)`
5. User can vote on milestones if connected.
6. The onramp block is a separate fiat-to-crypto entry point.

## Wallet Notes

Current provider setup:

- injected wallet is enabled by default
- WalletConnect is only enabled if `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set

Expected env var if needed:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Contract Notes

Frontend ABI is for `MilestoneEscrow`.

Main contract methods used or expected:

- `totalRaised()`
- `totalFundingGoal()`
- `donations(address)`
- `voteMilestone(uint256)`

Important:

- the current frontend still uses a placeholder escrow address
- real deployment wiring still needs to be done

## Backend Notes

The backend exposes:

- `GET /`
- `POST /verify-document`

`POST /verify-document` expects multipart form data:

- `hospitalId`
- `estimatedCost`
- `document`

Response shape:

```json
{
  "fraudRiskScore": 0.05,
  "isFlagged": false,
  "reasons": [],
  "extractedText": "optional OCR text",
  "hospitalVerified": true
}
```

## Current MVP Limitations

- single hardcoded campaign
- no real deployed escrow address in frontend
- backend fraud result is not fully integrated into the UI
- some campaign details are mock values

## Suggested Handoff Approach

If your friend is only doing UI work, they can:

1. keep `providers.tsx` and `WalletConnection.tsx`
2. redesign `page.tsx` and `CampaignDashboard.tsx`
3. preserve the wagmi reads/writes
4. later swap in real contract addresses and backend endpoints
