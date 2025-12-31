/**
 * World Currencies
 * Complete list of currencies supported by Stripe
 */

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    flag?: string;
}

export const currencies: Currency[] = [
    { code: 'usd', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'eur', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'gbp', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'inr', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'jpy', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'cny', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'aud', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'cad', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'chf', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
    { code: 'hkd', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
    { code: 'sgd', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
    { code: 'sek', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
    { code: 'nok', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
    { code: 'dkk', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
    { code: 'nzd', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
    { code: 'krw', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
    { code: 'mxn', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
    { code: 'brl', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'zar', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
    { code: 'rub', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
    { code: 'try', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
    { code: 'pln', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
    { code: 'thb', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
    { code: 'idr', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
    { code: 'myr', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
    { code: 'php', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
    { code: 'vnd', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
    { code: 'aed', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
    { code: 'sar', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
    { code: 'ils', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
    { code: 'egp', name: 'Egyptian Pound', symbol: '£', flag: '🇪🇬' },
    { code: 'ngn', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
    { code: 'pkr', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
    { code: 'bdt', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
    { code: 'lkr', name: 'Sri Lankan Rupee', symbol: 'Rs', flag: '🇱🇰' },
    { code: 'clp', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
    { code: 'cop', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
    { code: 'ars', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
    { code: 'pen', name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪' },
    { code: 'czk', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
    { code: 'huf', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
    { code: 'ron', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
    { code: 'bgn', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
    { code: 'hrk', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷' },
    { code: 'uah', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦' },
    { code: 'kzt', name: 'Kazakhstani Tenge', symbol: '₸', flag: '🇰🇿' },
    { code: 'qar', name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦' },
    { code: 'kwd', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
    { code: 'bhd', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭' },
    { code: 'omr', name: 'Omani Rial', symbol: '﷼', flag: '🇴🇲' },
];

export function getCurrencyByCode(code: string): Currency | undefined {
    return currencies.find((c) => c.code.toLowerCase() === code.toLowerCase());
}

export function formatAmount(amount: number, currencyCode: string): string {
    const currency = getCurrencyByCode(currencyCode);
    return `${currency?.symbol || ''}${amount.toLocaleString()}`;
}
