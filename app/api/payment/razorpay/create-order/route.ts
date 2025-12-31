import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, getTierDisplayName } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, tier, customerEmail, customerName, message } = body;

        // Validate required fields
        if (!amount || !tier || !customerEmail || !customerName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate amount
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        // Create Razorpay order (always INR for Razorpay domestic)
        const order = await createRazorpayOrder({
            amount: numericAmount,
            currency: 'INR',
            tier,
            customerName,
            customerEmail,
            message,
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            name: 'Support Srujan',
            description: getTierDisplayName(tier),
            prefill: {
                name: customerName,
                email: customerEmail,
            },
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);

        // Log failed payment attempt
        try {
            await logFailedPayment({
                gateway: 'razorpay',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            });
        } catch (logError) {
            console.error('Failed to log payment error:', logError);
        }

        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}

// Helper to log failed payments
async function logFailedPayment(data: {
    gateway: string;
    error: string;
    timestamp: string;
}) {
    // For now, just log to console
    // TODO: Integrate with Google Sheets
    console.error('Payment failed:', data);
}
