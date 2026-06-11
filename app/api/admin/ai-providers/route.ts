import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    PROVIDER_IDS, getProvidersStatus, getProviderConfig, getProviderOrder,
    writeConfigFile, testProvider, type ProviderId, type AIProvidersFile,
} from '@/lib/ai-providers';

const SESSION_NAME = 'admin_session';
const SESSION_VALUE = 'authenticated';

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

// GET - status of every provider (keys masked)
export async function GET() {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ providers: getProvidersStatus(), order: getProviderOrder() });
}

interface PutBody {
    order?: string[];
    providers?: Partial<Record<ProviderId, { enabled?: boolean; model?: string; keysRaw?: string }>>;
}

// PUT - save provider config. Masked keys ("...abcd") are preserved from the
// currently stored admin keys, matching the existing ai-settings behavior.
export async function PUT(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json() as PutBody;
        const next: AIProvidersFile = { providers: {} };

        if (Array.isArray(body.order)) {
            next.order = body.order.filter((p): p is ProviderId => PROVIDER_IDS.includes(p as ProviderId));
        }

        for (const id of PROVIDER_IDS) {
            const incoming = body.providers?.[id];
            if (!incoming) continue;

            const cfg = getProviderConfig(id);
            const currentKeys = cfg.keys; // effective (admin+env), used to resolve masks
            const envKeySet = new Set(
                (process.env[`${id.toUpperCase()}_API_KEYS`] || process.env[`${id.toUpperCase()}_API_KEY`] || '')
                    .split(',').map(k => k.trim()).filter(Boolean),
            );
            const rawList = (incoming.keysRaw || '')
                .split(/[\n,]/)
                .map(k => k.trim())
                .filter(Boolean);

            // Mask-merge: a masked entry keeps the stored key it masks
            const resolved = rawList.map(k => {
                if (k.includes('••') || k.startsWith('...')) {
                    const tail = k.slice(-4);
                    const match = currentKeys.find(real => real.endsWith(tail));
                    return match || '';
                }
                return k;
            }).filter(Boolean)
                // Never persist env-sourced keys to the JSON file — they are merged
                // back in at read time and should live only in the environment.
                .filter(k => !envKeySet.has(k));

            next.providers![id] = {
                enabled: incoming.enabled !== false,
                ...(incoming.model ? { model: String(incoming.model).slice(0, 80) } : {}),
                keys: Array.from(new Set(resolved)),
            };
        }

        writeConfigFile(next);
        return NextResponse.json({ success: true, providers: getProvidersStatus() });
    } catch (e) {
        console.error('Failed to save AI providers:', e);
        return NextResponse.json({ error: 'Failed to save provider config' }, { status: 500 });
    }
}

// POST - test one provider's connectivity: { provider: "groq" }
export async function POST(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json() as { provider?: string };
        const id = body.provider as ProviderId;
        if (!PROVIDER_IDS.includes(id)) {
            return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
        }
        const result = await testProvider(id);
        return NextResponse.json(result);
    } catch (e) {
        return NextResponse.json(
            { ok: false, detail: e instanceof Error ? e.message : 'Test failed' },
            { status: 500 },
        );
    }
}
