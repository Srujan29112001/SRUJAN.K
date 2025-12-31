import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            tier,
            customerName,
            customerEmail,
            amount,
            message,
        } = body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment verification fields' },
                { status: 400 }
            );
        }

        // Verify the payment signature
        const isValid = verifyPaymentSignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
        });

        if (!isValid) {
            console.error('Payment signature verification failed');

            await logFailedPayment({
                gateway: 'razorpay',
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                error: 'Signature verification failed',
                timestamp: new Date().toISOString(),
            });

            return NextResponse.json(
                { error: 'Payment verification failed', verified: false },
                { status: 400 }
            );
        }

        // Log successful payment
        await logSuccessfulPayment({
            gateway: 'razorpay',
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            customerEmail: customerEmail || '',
            customerName: customerName || '',
            amount: parseFloat(amount) || 0,
            currency: 'INR',
            tier: tier || '',
            message: message || '',
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            verified: true,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
        });
    } catch (error) {
        console.error('Razorpay verification error:', error);

        await logFailedPayment({
            gateway: 'razorpay',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
            { error: 'Payment verification failed', verified: false },
            { status: 500 }
        );
    }
}

// Helper to log successful payments
async function logSuccessfulPayment(data: {
    gateway: string;
    orderId: string;
    paymentId: string;
    customerEmail: string;
    customerName: string;
    amount: number;
    currency: string;
    tier: string;
    message: string;
    timestamp: string;
}) {
    // For now, just log to console
    // TODO: Integrate with Google Sheets
    console.log('Payment successful:', data);
}

// Helper to log failed payments
async function logFailedPayment(data: {
    gateway: string;
    orderId?: string;
    paymentId?: string;
    error: string;
    timestamp: string;
}) {
    // For now, just log to console
    // TODO: Integrate with Google Sheets
    console.error('Payment failed:', data);
}
