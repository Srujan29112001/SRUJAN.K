import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const SESSION_NAME = 'admin_session';
const SESSION_VALUE = 'authenticated';
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'tier-settings.json');

interface TierCurrency {
    amount: number;
    paymentLink: string;
}

interface TierSettings {
    usd: TierCurrency;
    inr: TierCurrency;
}

interface AllSettings {
    coffee: TierSettings;
    applause: TierSettings;
}

// Check if admin is authenticated
async function isAuthenticated(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get(SESSION_NAME);
        return session?.value === SESSION_VALUE;
    } catch {
        return false;
    }
}

// Read settings from JSON file
function getSettings(): AllSettings {
    try {
        const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        // Return defaults if file doesn't exist
        return {
            coffee: {
                usd: { amount: 25, paymentLink: '' },
                inr: { amount: 2000, paymentLink: '' }
            },
            applause: {
                usd: { amount: 100, paymentLink: '' },
                inr: { amount: 8500, paymentLink: '' }
            }
        };
    }
}

// Write settings to JSON file
function saveSettings(data: AllSettings): void {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

// GET - Get current settings (public - needed for support page)
export async function GET() {
    const settings = getSettings();
    return NextResponse.json(settings);
}

// PUT - Update settings (admin only)
export async function PUT(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const newSettings = await request.json();

        // Validate structure
        if (!newSettings.coffee || !newSettings.applause) {
            return NextResponse.json(
                { error: 'Invalid settings structure' },
                { status: 400 }
            );
        }

        saveSettings(newSettings);
        return NextResponse.json({ success: true, settings: newSettings });
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json(
            { error: 'Failed to save settings' },
            { status: 500 }
        );
    }
}
