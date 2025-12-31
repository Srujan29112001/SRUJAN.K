/**
 * Verified Investors Database
 * 
 * Add verified clients/investors here. Only these users can access
 * the "Fund a Breakthrough" tier with their preset amounts.
 * 
 * To add a new verified investor:
 * 1. Add their email (lowercase)
 * 2. Add their name
 * 3. Set their preset amount
 * 4. Set their currency code (e.g., 'usd', 'inr')
 * 5. Add their Skydo payment link (for USD payments)
 */

export interface VerifiedInvestor {
    email: string;        // Must be lowercase
    name: string;
    amount: number;       // Preset amount they should pay
    currency: string;     // Currency code (e.g., 'usd', 'inr')
    paymentLink?: string; // Skydo payment link for USD payments
}

export const verifiedInvestors: VerifiedInvestor[] = [
    {
        email: "srujan.hardik@gmail.com",
        name: "Srujan Katta",
        amount: 1000,
        currency: "usd",
        paymentLink: "https://dashboard.skydo.com/pay/pyl_7J2ceW",
    },
    {
        email: "ksrujan_be19@thapar.edu",
        name: "Srujan (Thapar)",
        amount: 2000,
        currency: "usd",
        paymentLink: "https://dashboard.skydo.com/pay/pyl_KxapH3",
    },
    {
        email: "kt.srujan@gmail.com",
        name: "KT Srujan",
        amount: 1500,
        currency: "usd",
        paymentLink: "https://dashboard.skydo.com/pay/pyl_yp6w8C",
    },
    {
        email: "srujan@gmail.com",
        name: "Srujan",
        amount: 10000,
        currency: "inr",
        // No Skydo link - uses Razorpay for INR payments
    },
];

/**
 * Check if an email is in the verified investors list
 */
export function findVerifiedInvestor(email: string): VerifiedInvestor | undefined {
    const normalizedEmail = email.toLowerCase().trim();
    return verifiedInvestors.find(
        (investor) => investor.email.toLowerCase() === normalizedEmail
    );
}
