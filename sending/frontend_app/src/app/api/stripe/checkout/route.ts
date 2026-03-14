import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, destinationWallet } = await request.json();

    // Stripe requires amount in smallest currency unit (e.g. paise for INR, cents for USD)
    const amountInPaise = Math.round(Number(amount) * 100);

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': 'inr',
        'line_items[0][price_data][unit_amount]': amountInPaise.toString(),
        'line_items[0][price_data][product_data][name]': 'USDC Onramp Deposit',
        'line_items[0][price_data][product_data][description]': `Destination Wallet: ${destinationWallet}`,
        'line_items[0][quantity]': '1',
        'metadata[wallet]': destinationWallet,
        'metadata[inrAmount]': amount.toString(),
        'metadata[usdcAmount]': (Number(amount) / 84.5).toFixed(2), // Estimating USDC (84.5 INR/USDC)
        'mode': 'payment',
        'success_url': `${origin}/onramp?session_id={CHECKOUT_SESSION_ID}&stripe_success=true&amount=${amount}`,
        'cancel_url': `${origin}/onramp`,
      }),
    });

    const session = await res.json();
    
    if (!res.ok) {
      console.error("Stripe Error:", session);
      return NextResponse.json({ error: session.error.message }, { status: 400 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
