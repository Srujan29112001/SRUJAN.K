import { NextResponse } from 'next/server';
import { sendThankYouEmail, PaymentTier } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { recipientEmail, recipientName, tier, amount, currency, message } = await request.json();

        // Validate required fields
        if (!recipientEmail || !recipientName || !tier || !amount) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate tier
        if (!['coffee', 'applause', 'breakthrough'].includes(tier)) {
            return NextResponse.json(
                { success: false, error: 'Invalid tier' },
                { status: 400 }
            );
        }

        const result = await sendThankYouEmail({
            recipientEmail,
            recipientName,
            tier: tier as PaymentTier,
            amount,
            currency: currency || 'usd',
            message,
        });

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Send thank you email error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
