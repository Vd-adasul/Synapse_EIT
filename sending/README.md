# Sending Package

This folder is a clean handoff package for UI integration and redesign work.

It includes the essential frontend files, wallet connection flow, and contract ABI your friend needs to:

- change the UI
- wire a new frontend around the existing flow
- understand what is mocked vs what is real

## Folder Structure

```text
sending/
  README.md
  notes/
    integration-notes.md
  frontend_app/
    package.json
    src/
      app/
        globals.css
        layout.tsx
        page.tsx
        providers.tsx
      components/
        CampaignDashboard.tsx
        OnrampWidget.tsx
        WalletConnection.tsx
      abis/
        MilestoneEscrow.ts
```

## What Is Included

- `frontend_app/src/app/page.tsx`
  The main landing page and top-level campaign view.
- `frontend_app/src/components/CampaignDashboard.tsx`
  The core fundraiser UI with campaign stats, milestones, reads, and voting.
- `frontend_app/src/components/WalletConnection.tsx`
  The wallet connect/disconnect and Polygon Amoy network switch logic.
- `frontend_app/src/app/providers.tsx`
  Wagmi wallet provider setup.
- `frontend_app/src/components/OnrampWidget.tsx`
  Fiat-to-USDC onramp iframe block.
- `frontend_app/src/abis/MilestoneEscrow.ts`
  ABI used by the frontend to read from and write to the escrow contract.

## Important Notes

- The current frontend is still MVP/demo quality.
- The campaign content is partly mocked.
- The escrow contract address is still a placeholder.
- The wallet flow is set up primarily for `Polygon Amoy`.
- `WalletConnect` is optional and needs `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` if they want QR/mobile wallet support.
- MetaMask or another injected browser wallet should work without that env var.

## What Your Friend Should Change First

1. Replace the current UI in `CampaignDashboard.tsx` and `page.tsx`.
2. Keep the wallet/provider wiring unless they want a different wallet UX.
3. Replace the placeholder escrow contract address with a real deployed contract.
4. If they want backend fraud verification in the UI, wire the API described in `notes/integration-notes.md`.

## What Is Not Included

- Full backend source tree
- Full smart contract source tree
- deployment scripts
- datasets and unrelated hackathon files

Those were left out to keep this package focused on integration and UI work.
