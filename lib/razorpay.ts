// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay');
import crypto from 'crypto';

if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('Warning: Razorpay keys are not set. Razorpay payments will not work.');
}

export const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * Create a Razorpay Order for INR payment
 */
export async function createRazorpayOrder({
    amount,
    currency = 'INR',
    tier,
    customerName,
    customerEmail,
    message,
}: {
    amount: number;
    currency?: string;
    tier: string;
    customerName: string;
    customerEmail: string;
    message?: string;
}) {
    // Razorpay expects amount in paise (smallest unit)
    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        receipt: `receipt_${Date.now()}`,
        notes: {
            tier,
            customerName,
            customerEmail,
            message: message || '',
        },
    });

    return order;
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature({
    orderId,
    paymentId,
    signature,
}: {
    orderId: string;
    paymentId: string;
    signature: string;
}): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        throw new Error('Razorpay secret key not configured');
    }

    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    return expectedSignature === signature;
}

/**
 * Get tier display name for Razorpay
 */
export function getTierDisplayName(tier: string): string {
    switch (tier) {
        case 'coffee':
            return 'Buy Me a Coffee';
        case 'applause':
            return 'Applause for a Project';
        case 'breakthrough':
            return 'Fund a Breakthrough';
        default:
            return 'Support Srujan';
    }
}
