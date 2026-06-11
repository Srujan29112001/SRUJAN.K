/**
 * =============================================================================
 * MULTI-PROVIDER LLM LAYER
 * =============================================================================
 * One interface over many providers: OpenAI, Anthropic (Claude), Google Gemini,
 * Groq, DeepSeek, Z.ai (GLM). Used by the resume agent pipeline (and any future
 * server-side AI feature).
 *
 * Key features:
 *  - Per-provider key lists with rotation + cooldown on 429 (same strategy the
 *    chat route uses for its 12 Gemini keys)
 *  - Provider fallback: walk the configured order until one succeeds
 *  - generateText / generateJSON (JSON mode with fence-stripping + one retry)
 *  - Config = data/ai-providers.json (admin-edited, gitignored) merged over env:
 *      {PROVIDER}_API_KEYS / {PROVIDER}_API_KEY   comma-separated keys
 *      {PROVIDER}_MODEL                            model override
 *      AI_PROVIDER_ORDER                           comma-separated priority
 *
 * All providers except Anthropic speak the OpenAI chat-completions dialect
 * (Gemini via its /openai compatibility endpoint), so there are exactly two
 * HTTP callers here.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';

export type ProviderId = 'gemini' | 'groq' | 'openai' | 'anthropic' | 'deepseek' | 'zai';

export const PROVIDER_IDS: ProviderId[] = ['gemini', 'groq', 'openai', 'anthropic', 'deepseek', 'zai'];

export const PROVIDER_LABELS: Record<ProviderId, string> = {
    gemini: 'Google Gemini',
    groq: 'Groq',
    openai: 'OpenAI',
    anthropic: 'Anthropic Claude',
    deepseek: 'DeepSeek',
    zai: 'Z.ai (GLM)',
};

interface ProviderSpec {
    /** OpenAI-compatible chat completions URL, or Anthropic messages URL */
    url: string;
    dialect: 'openai' | 'anthropic';
    defaultModel: string;
    /** Whether the endpoint accepts response_format: {type:'json_object'} */
    supportsJsonMode: boolean;
    envPrefix: string;
    /** Provider-specific extra body params (e.g. Gemini reasoning budget) */
    extraBody?: Record<string, unknown>;
}

const SPECS: Record<ProviderId, ProviderSpec> = {
    gemini: {
        url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        dialect: 'openai',
        defaultModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        supportsJsonMode: true,
        envPrefix: 'GEMINI',
        // 2.5-flash burns "thinking" tokens from max_tokens on this endpoint;
        // keep reasoning minimal so structured outputs don't truncate.
        extraBody: { reasoning_effort: 'low' },
    },
    groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        dialect: 'openai',
        defaultModel: 'llama-3.3-70b-versatile',
        supportsJsonMode: true,
        envPrefix: 'GROQ',
    },
    openai: {
        url: 'https://api.openai.com/v1/chat/completions',
        dialect: 'openai',
        defaultModel: 'gpt-4o-mini',
        supportsJsonMode: true,
        envPrefix: 'OPENAI',
    },
    anthropic: {
        url: 'https://api.anthropic.com/v1/messages',
        dialect: 'anthropic',
        defaultModel: 'claude-haiku-4-5-20251001',
        supportsJsonMode: false,
        envPrefix: 'ANTHROPIC',
    },
    deepseek: {
        url: 'https://api.deepseek.com/v1/chat/completions',
        dialect: 'openai',
        defaultModel: 'deepseek-chat',
        supportsJsonMode: true,
        envPrefix: 'DEEPSEEK',
    },
    zai: {
        url: 'https://api.z.ai/api/paas/v4/chat/completions',
        dialect: 'openai',
        defaultModel: 'glm-4.6',
        supportsJsonMode: false,
        envPrefix: 'ZAI',
    },
};

// =============================================================================
// CONFIG (admin file merged over env)
// =============================================================================

export interface ProviderConfig {
    enabled: boolean;
    model: string;
    keys: string[];
    /** where the active keys came from, for the admin UI */
    keySources: { admin: number; env: number };
    /** env keys exist but may be excluded via useEnvKeys=false */
    envAvailable: number;
    useEnvKeys: boolean;
}

export interface AIProvidersFile {
    order?: string[];
    providers?: Partial<Record<ProviderId, {
        enabled?: boolean;
        model?: string;
        keys?: string[];
        /** false → ignore environment-variable keys for this provider */
        useEnvKeys?: boolean;
    }>>;
}

const CONFIG_FILE = path.join(process.cwd(), 'data', 'ai-providers.json');

function readConfigFile(): AIProvidersFile {
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) as AIProvidersFile;
    } catch {
        return {};
    }
}

export function writeConfigFile(cfg: AIProvidersFile): void {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

function envKeys(prefix: string): string[] {
    const multi = process.env[`${prefix}_API_KEYS`];
    if (multi) return multi.split(',').map(k => k.trim()).filter(Boolean);
    const single = process.env[`${prefix}_API_KEY`];
    return single ? [single.trim()] : [];
}

/** Resolve the effective config for one provider (admin file > env). */
export function getProviderConfig(id: ProviderId): ProviderConfig {
    const spec = SPECS[id];
    const file = readConfigFile();
    const fileCfg = file.providers?.[id] || {};
    const envAvailable = envKeys(spec.envPrefix);
    const useEnvKeys = fileCfg.useEnvKeys !== false; // included unless explicitly excluded
    const fromEnv = useEnvKeys ? envAvailable : [];
    const fromAdmin = (fileCfg.keys || []).map(k => k.trim()).filter(Boolean);
    // admin keys first (explicit intent), env keys appended, deduped
    const keys = Array.from(new Set([...fromAdmin, ...fromEnv]));
    return {
        enabled: fileCfg.enabled !== false, // enabled unless explicitly disabled
        model: fileCfg.model || process.env[`${spec.envPrefix}_MODEL`] || spec.defaultModel,
        keys,
        keySources: { admin: fromAdmin.length, env: fromEnv.length },
        envAvailable: envAvailable.length,
        useEnvKeys,
    };
}

/** Provider priority: admin file > AI_PROVIDER_ORDER env > keyed providers in default order. */
export function getProviderOrder(): ProviderId[] {
    const file = readConfigFile();
    const raw = file.order?.length
        ? file.order
        : (process.env.AI_PROVIDER_ORDER || '').split(',').map(s => s.trim()).filter(Boolean);
    const valid = raw.filter((p): p is ProviderId => PROVIDER_IDS.includes(p as ProviderId));
    const rest = PROVIDER_IDS.filter(p => !valid.includes(p));
    return [...valid, ...rest];
}

/** Snapshot of every provider for the admin UI (keys masked). */
export function getProvidersStatus() {
    return getProviderOrder().map(id => {
        const cfg = getProviderConfig(id);
        return {
            id,
            label: PROVIDER_LABELS[id],
            enabled: cfg.enabled,
            model: cfg.model,
            keyCount: cfg.keys.length,
            keySources: cfg.keySources,
            envAvailable: cfg.envAvailable,
            useEnvKeys: cfg.useEnvKeys,
            // mask only the ADMIN-entered keys for the textarea; env keys are
            // controlled by the separate toggle, not the textarea
            maskedKeys: cfg.keys.slice(0, cfg.keySources.admin).map(k => `...${k.slice(-4)}`),
            ready: cfg.enabled && cfg.keys.length > 0,
        };
    });
}

// =============================================================================
// KEY ROTATION (per-key cooldown on rate limits, shared across requests)
// =============================================================================

const keyCooldowns = new Map<string, number>(); // key → timestamp it becomes usable

function nextKey(keys: string[]): string | null {
    const now = Date.now();
    for (const k of keys) {
        if ((keyCooldowns.get(k) || 0) < now) return k;
    }
    return null;
}

function coolKey(key: string, ms = 60_000) {
    keyCooldowns.set(key, Date.now() + ms);
}

// =============================================================================
// CALLERS
// =============================================================================

export interface ChatTurn {
    role: 'user' | 'assistant';
    content: string;
}

export interface LLMRequest {
    system?: string;
    prompt: string;
    /** optional prior conversation turns, inserted between system and prompt */
    messages?: ChatTurn[];
    temperature?: number;
    maxTokens?: number;
    /** force a specific provider instead of walking the order */
    provider?: ProviderId;
    /** request JSON output (json_object mode where supported + instruction) */
    json?: boolean;
    /**
     * BYOK: use this exact API key instead of configured keys.
     * The key is used transiently — never stored, never logged.
     */
    overrideKey?: string;
    /** BYOK: use this model instead of the configured one */
    overrideModel?: string;
}

export interface LLMResult {
    text: string;
    provider: ProviderId;
    model: string;
}

async function callOpenAICompat(
    spec: ProviderSpec, model: string, key: string, req: LLMRequest,
): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
    const body: Record<string, unknown> = {
        model,
        messages: [
            ...(req.system ? [{ role: 'system', content: req.system }] : []),
            ...(req.messages || []).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: req.prompt },
        ],
        temperature: req.temperature ?? 0.4,
        max_tokens: req.maxTokens ?? 4096,
        ...(spec.extraBody || {}),
    };
    if (req.json && spec.supportsJsonMode) body.response_format = { type: 'json_object' };

    const res = await fetch(spec.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        return { ok: false, status: res.status, error: errText.slice(0, 300) };
    }
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content;
    if (!text) return { ok: false, status: 200, error: 'Empty completion' };
    return { ok: true, text };
}

async function callAnthropic(
    spec: ProviderSpec, model: string, key: string, req: LLMRequest,
): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
    const res = await fetch(spec.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model,
            max_tokens: req.maxTokens ?? 2048,
            temperature: req.temperature ?? 0.4,
            ...(req.system ? { system: req.system } : {}),
            messages: [
                ...(req.messages || []).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: req.prompt },
            ],
        }),
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        return { ok: false, status: res.status, error: errText.slice(0, 300) };
    }
    const data = await res.json() as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.find(b => b.type === 'text')?.text;
    if (!text) return { ok: false, status: 200, error: 'Empty completion' };
    return { ok: true, text };
}

/**
 * Call one provider, rotating through its keys (max 3 attempts per provider).
 * With req.overrideKey (BYOK), exactly that key is used — it is never stored
 * in the cooldown map (which would retain user secrets in memory).
 */
async function callProvider(id: ProviderId, req: LLMRequest): Promise<
    { ok: true; result: LLMResult } | { ok: false; error: string }
> {
    const spec = SPECS[id];
    const isByok = !!req.overrideKey;
    const cfg = getProviderConfig(id);
    if (!isByok && (!cfg.enabled || cfg.keys.length === 0)) {
        return { ok: false, error: `${id}: no keys / disabled` };
    }
    const keys = isByok ? [req.overrideKey!] : cfg.keys;
    const model = req.overrideModel || cfg.model;

    let lastError = '';
    let overloadRetries = 0;
    const attempts = Math.min(keys.length, 3) + 2; // headroom for 503 retries
    for (let i = 0; i < attempts; i++) {
        const key = isByok ? keys[0] : nextKey(keys);
        if (!key) { lastError = `${id}: all keys cooling down`; break; }
        try {
            const out = spec.dialect === 'anthropic'
                ? await callAnthropic(spec, model, key, req)
                : await callOpenAICompat(spec, model, key, req);
            if (out.ok) {
                return { ok: true, result: { text: out.text, provider: id, model } };
            }
            lastError = `${id} ${out.status}: ${out.error}`;
            if (out.status === 429) {
                if (isByok) break; // user's own quota — surface immediately
                coolKey(key);
                continue; // rate limit is per-key → rotate
            }
            if (out.status === 401 || out.status === 403) {
                if (isByok) { lastError = `${id} ${out.status}: API key rejected`; break; }
                coolKey(key, 10 * 60_000);
                continue;
            }
            if (out.status >= 500) {
                // Model-wide overload — the key is fine; wait briefly and retry (max 2x)
                overloadRetries++;
                if (overloadRetries <= 2) { await new Promise(r => setTimeout(r, 1200 * overloadRetries)); continue; }
                break;
            }
            break; // 4xx bad request — same payload won't get better
        } catch (e) {
            lastError = `${id} network: ${e instanceof Error ? e.message : 'error'}`;
        }
    }
    return { ok: false, error: lastError || `${id}: failed` };
}

/**
 * Generate text, walking the provider order until one succeeds.
 * Throws only if every configured provider fails.
 */
export async function generateText(req: LLMRequest): Promise<LLMResult> {
    const order = req.provider ? [req.provider] : getProviderOrder();
    const errors: string[] = [];
    for (const id of order) {
        const out = await callProvider(id, req);
        if (out.ok) return out.result;
        errors.push(out.error);
    }
    throw new Error(`All providers failed: ${errors.join(' | ')}`);
}

/** True if at least one provider is ready (enabled + has keys). */
export function hasAnyProvider(): boolean {
    return getProviderOrder().some(id => {
        const c = getProviderConfig(id);
        return c.enabled && c.keys.length > 0;
    });
}

function stripFences(text: string): string {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    return (m ? m[1] : text).trim();
}

/**
 * Generate and parse JSON. Retries once with an explicit fix-it prompt on
 * parse failure. Throws if no provider succeeds or JSON never parses.
 */
export async function generateJSON<T>(req: LLMRequest): Promise<{ data: T; provider: ProviderId; model: string }> {
    const jsonReq: LLMRequest = {
        ...req,
        json: true,
        prompt: `${req.prompt}\n\nRespond with ONLY valid JSON. No prose, no markdown fences.`,
    };
    const first = await generateText(jsonReq);
    try {
        return { data: JSON.parse(stripFences(first.text)) as T, provider: first.provider, model: first.model };
    } catch {
        const retry = await generateText({
            ...jsonReq,
            prompt: `${jsonReq.prompt}\n\nYour previous output was not valid JSON:\n${first.text.slice(0, 800)}\n\nOutput the corrected JSON only.`,
        });
        return { data: JSON.parse(stripFences(retry.text)) as T, provider: retry.provider, model: retry.model };
    }
}

/**
 * One-shot connectivity test for the admin UI.
 * Pass opts.key/opts.model to test UNSAVED values straight from the form —
 * otherwise the stored config is used.
 */
export async function testProvider(
    id: ProviderId,
    opts?: { key?: string; model?: string },
): Promise<{ ok: boolean; detail: string; latencyMs?: number }> {
    const cfg = getProviderConfig(id);
    if (!opts?.key && cfg.keys.length === 0) {
        return { ok: false, detail: 'No API keys configured (paste a key, then Test — saving is not required)' };
    }
    const start = Date.now();
    const out = await callProvider(id, {
        prompt: 'Reply with the single word: ok',
        maxTokens: 1000,
        temperature: 0,
        ...(opts?.key ? { overrideKey: opts.key } : {}),
        ...(opts?.model ? { overrideModel: opts.model } : {}),
    });
    const model = opts?.model || cfg.model;
    if (out.ok) return { ok: true, detail: `${model} responded`, latencyMs: Date.now() - start };
    return { ok: false, detail: out.error };
}
