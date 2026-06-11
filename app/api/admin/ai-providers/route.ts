import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    PROVIDER_IDS, getProvidersStatus, getProviderConfig, getProviderOrder,
    writeConfig, testProvider, hydrateConfigFromKV, kvConfigAvailable,
    type ProviderId, type AIProvidersFile,
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
    await hydrateConfigFromKV(true);
    return NextResponse.json({
        providers: getProvidersStatus(),
        order: getProviderOrder(),
        durableStore: kvConfigAvailable() ? 'kv' : 'file',
    });
}

interface PutBody {
    order?: string[];
    providers?: Partial<Record<ProviderId, { enabled?: boolean; model?: string; keysRaw?: string; useEnvKeys?: boolean }>>;
}

/** Resolve a raw textarea key list against stored keys (mask-aware). */
function resolveKeys(id: ProviderId, keysRaw: string): string[] {
    const currentKeys = getProviderConfig(id).keys;
    return keysRaw
        .split(/[\n,]/)
        .map(k => k.trim())
        .filter(Boolean)
        .map(k => {
            if (k.includes('••') || k.startsWith('...')) {
                const tail = k.slice(-4);
                return currentKeys.find(real => real.endsWith(tail)) || '';
            }
            return k;
        })
        .filter(Boolean);
}

// PUT - save provider config. Masked keys ("...abcd") are preserved from the
// currently stored admin keys, matching the existing ai-settings behavior.
export async function PUT(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await hydrateConfigFromKV(true); // masks must resolve against the live store
        const body = await request.json() as PutBody;
        const next: AIProvidersFile = { providers: {} };

        if (Array.isArray(body.order)) {
            next.order = body.order.filter((p): p is ProviderId => PROVIDER_IDS.includes(p as ProviderId));
        }

        for (const id of PROVIDER_IDS) {
            const incoming = body.providers?.[id];
            if (!incoming) continue;

            const envKeySet = new Set(
                (process.env[`${id.toUpperCase()}_API_KEYS`] || process.env[`${id.toUpperCase()}_API_KEY`] || '')
                    .split(',').map(k => k.trim()).filter(Boolean),
            );

            // Mask-merge, then never persist env-sourced keys to the JSON file —
            // they are merged back at read time and live only in the environment.
            const resolved = resolveKeys(id, incoming.keysRaw || '').filter(k => !envKeySet.has(k));

            next.providers![id] = {
                enabled: incoming.enabled !== false,
                useEnvKeys: incoming.useEnvKeys !== false,
                ...(incoming.model ? { model: String(incoming.model).slice(0, 80) } : {}),
                keys: Array.from(new Set(resolved)),
            };
        }

        let persistedTo: 'kv' | 'file';
        try {
            persistedTo = await writeConfig(next);
        } catch (writeErr) {
            // No KV configured AND read-only filesystem (Vercel without Upstash)
            console.error('Provider config write failed:', writeErr);
            return NextResponse.json({
                error: 'Could not persist config — this host has a read-only filesystem and no KV store is connected. '
                    + 'Either add the free Upstash Redis integration in Vercel (Storage → Upstash → connect; saves then work from this page), '
                    + 'or set keys via environment variables (e.g. GROQ_API_KEYS) in the Vercel dashboard.',
            }, { status: 500 });
        }
        return NextResponse.json({ success: true, providers: getProvidersStatus(), persistedTo });
    } catch (e) {
        console.error('Failed to save AI providers:', e);
        return NextResponse.json({ error: 'Failed to save provider config' }, { status: 500 });
    }
}

// POST - test a provider's connectivity. Accepts the CURRENT form values so
// admins can test keys before saving: { provider, keysRaw?, model? }
export async function POST(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await hydrateConfigFromKV();
        const body = await request.json() as { provider?: string; keysRaw?: string; model?: string };
        const id = body.provider as ProviderId;
        if (!PROVIDER_IDS.includes(id)) {
            return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
        }
        // Use the first key from the form (mask-resolved) when provided
        const formKeys = body.keysRaw ? resolveKeys(id, body.keysRaw) : [];
        const result = await testProvider(id, {
            ...(formKeys[0] ? { key: formKeys[0] } : {}),
            ...(body.model ? { model: String(body.model).slice(0, 80) } : {}),
        });
        return NextResponse.json(result);
    } catch (e) {
        return NextResponse.json(
            { ok: false, detail: e instanceof Error ? e.message : 'Test failed' },
            { status: 500 },
        );
    }
}
