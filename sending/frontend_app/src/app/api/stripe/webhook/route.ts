import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Important: Strip out the raw body for Stripe signature validation if needed
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const event = JSON.parse(rawBody);

    // Only process successful checkout sessions
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Ensure we have our custom metadata that we added during checkout creation
      const destinationWallet = session.metadata?.wallet;
      const usdcAmount = session.metadata?.usdcAmount;

      if (!destinationWallet || !usdcAmount) {
        console.error("Missing metadata for wallet or usdcAmount", session.metadata);
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      console.log(`[Webhook] Processing fiat-to-crypto for Wallet: ${destinationWallet}, Amount: ${usdcAmount} USDC`);

      // ----------------------------------------------------
      // AUTOMATIC USDC TRANSFER LOGIC (Treasury -> User)
      // ----------------------------------------------------
      
      // FOR THE HACKATHON: We use an RPC url and a Treasury Private Key. 
      // If these environment variables are not set, we will log a simulation success but skip the real TX to prevent crashing.
      const NEXT_PUBLIC_POLYGON_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC || "https://polygon-rpc.com";
      const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;

      if (!TREASURY_PRIVATE_KEY) {
        console.warn("⚠️ [Simulation Only] No TREASURY_PRIVATE_KEY found in ENV. Skipping actual Polygon Blockchain transfer.");
        console.log(`✅ [Simulated Transfer] Successfully "sent" ${usdcAmount} USDC to ${destinationWallet} on Polygon RPC: ${NEXT_PUBLIC_POLYGON_RPC}`);
        return NextResponse.json({ received: true, simulated: true });
      }

      try {
        // Because you gave me a local Hardhat/Anvil test key (Account #10, 10000 ETH),
        // we will connect to a local Node (http://127.0.0.1:8545) or the fallback RPC
        const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC || "http://127.0.0.1:8545";
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

        console.log(`⏳ Sending transaction to network at ${rpcUrl}...`);
        
        // Since we are using a local test network that doesn't have the Polygon USDC smart contract deployed,
        // we will send the Native Token (ETH/MATIC) to represent the USDC during the demo. 
        // This guarantees your hackathon demo will flawlessly execute without "contract not found" errors!
        const amountToTransfer = ethers.parseEther(usdcAmount.toString()); // Convert 11.83 to wei

        const tx = await wallet.sendTransaction({
          to: destinationWallet,
          value: amountToTransfer
        });
        
        console.log(`✅ Transaction submitted! Hash: ${tx.hash}`);

        // Wait for 1 block confirmation
        await tx.wait(1);
        console.log(`🎉 Hackathon Demo Transfer Confirmed!`);

        return NextResponse.json({ received: true, txHash: tx.hash });
      } catch (blockchainError: any) {
        console.error("❌ Blockchain Transfer Failed:", blockchainError);
        return NextResponse.json({ error: "Blockchain transfer failed", message: blockchainError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
