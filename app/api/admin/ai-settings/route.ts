import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const SESSION_NAME = 'admin_session';
const SESSION_VALUE = 'authenticated';
const ENV_FILE = path.join(process.cwd(), '.env.local');

interface AISettings {
    geminiApiKeys: string[]; // Support multiple API keys for rotation
    geminiModel: string;
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

// Parse .env.local file into key-value pairs
function parseEnvFile(): Record<string, string> {
    try {
        if (!fs.existsSync(ENV_FILE)) {
            return {};
        }
        const content = fs.readFileSync(ENV_FILE, 'utf-8');
        const lines = content.split('\n');
        const env: Record<string, string> = {};

        for (const line of lines) {
            const trimmed = line.trim();
            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('#')) continue;

            const equalIndex = trimmed.indexOf('=');
            if (equalIndex > 0) {
                const key = trimmed.substring(0, equalIndex).trim();
                let value = trimmed.substring(equalIndex + 1).trim();
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        }

        return env;
    } catch (error) {
        console.error('Error parsing .env.local:', error);
        return {};
    }
}

// Write key-value pairs back to .env.local file
function writeEnvFile(env: Record<string, string>): void {
    const lines: string[] = [];

    // Read existing file to preserve comments and order
    if (fs.existsSync(ENV_FILE)) {
        const content = fs.readFileSync(ENV_FILE, 'utf-8');
        const existingLines = content.split('\n');
        const writtenKeys = new Set<string>();

        for (const line of existingLines) {
            const trimmed = line.trim();

            // Keep comments and empty lines
            if (!trimmed || trimmed.startsWith('#')) {
                lines.push(line);
                continue;
            }

            const equalIndex = trimmed.indexOf('=');
            if (equalIndex > 0) {
                const key = trimmed.substring(0, equalIndex).trim();
                if (key in env) {
                    // Update with new value
                    lines.push(`${key}=${env[key]}`);
                    writtenKeys.add(key);
                } else {
                    // Keep existing value
                    lines.push(line);
                }
            } else {
                lines.push(line);
            }
        }

        // Add any new keys that weren't in the original file
        for (const [key, value] of Object.entries(env)) {
            if (!writtenKeys.has(key)) {
                lines.push(`${key}=${value}`);
            }
        }
    } else {
        // Create new file with all keys
        for (const [key, value] of Object.entries(env)) {
            lines.push(`${key}=${value}`);
        }
    }

    fs.writeFileSync(ENV_FILE, lines.join('\n'));
}

// Get AI settings from .env.local
function getAISettings(): AISettings {
    const env = parseEnvFile();

    // Parse multiple API keys (comma-separated in GEMINI_API_KEYS or single in GEMINI_API_KEY)
    const apiKeysStr = env['GEMINI_API_KEYS'] || '';
    const singleKey = env['GEMINI_API_KEY'] || '';

    let apiKeys: string[] = [];
    if (apiKeysStr) {
        apiKeys = apiKeysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
    } else if (singleKey) {
        apiKeys = [singleKey];
    }

    return {
        geminiApiKeys: apiKeys,
        geminiModel: env['GEMINI_MODEL'] || 'gemini-2.0-flash',
    };
}

// Save AI settings to .env.local
function saveAISettings(settings: AISettings): void {
    const env = parseEnvFile();

    // Store multiple keys as comma-separated in GEMINI_API_KEYS
    env['GEMINI_API_KEYS'] = settings.geminiApiKeys.join(',');

    // Also keep GEMINI_API_KEY for backwards compatibility (first key)
    env['GEMINI_API_KEY'] = settings.geminiApiKeys[0] || '';

    env['GEMINI_MODEL'] = settings.geminiModel;
    writeEnvFile(env);
}

// GET - Get current AI settings (admin only)
export async function GET() {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = getAISettings();

    // Mask all API keys for security (show only last 4 chars)
    const maskedKeys = settings.geminiApiKeys.map(key =>
        key ? '••••••••••••' + key.slice(-4) : ''
    );

    return NextResponse.json({
        geminiApiKeys: maskedKeys,
        geminiApiKeyCount: settings.geminiApiKeys.length,
        geminiModel: settings.geminiModel,
    });
}

// PUT - Update AI settings (admin only)
export async function PUT(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { geminiApiKeys, geminiModel } = body;

        // Get current settings
        const currentSettings = getAISettings();

        // Process API keys - filter out empty and masked ones, keep new real keys
        let newApiKeys: string[] = [];

        if (Array.isArray(geminiApiKeys)) {
            newApiKeys = geminiApiKeys
                .map((key: string, index: number) => {
                    // If it's masked, use the existing key at that index
                    if (key.includes('••••')) {
                        return currentSettings.geminiApiKeys[index] || '';
                    }
                    // Otherwise use the new key
                    return key.trim();
                })
                .filter((key: string) => key.length > 0);
        }

        // If no valid keys provided, keep current keys
        if (newApiKeys.length === 0) {
            newApiKeys = currentSettings.geminiApiKeys;
        }

        // Use provided model or keep current
        const newModel = geminiModel?.trim() || currentSettings.geminiModel;

        // Save settings
        saveAISettings({
            geminiApiKeys: newApiKeys,
            geminiModel: newModel,
        });

        return NextResponse.json({
            success: true,
            keyCount: newApiKeys.length,
            message: `AI settings saved with ${newApiKeys.length} API key(s). Server restart may be required.`,
        });
    } catch (error) {
        console.error('Error saving AI settings:', error);
        return NextResponse.json(
            { error: 'Failed to save AI settings' },
            { status: 500 }
        );
    }
}
