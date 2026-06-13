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

export type ProviderId = 'gemini' | 'groq' | 'openai' | 'anthropic' | 'deepseek' | 'zai' | 'huggingface';

export const PROVIDER_IDS: ProviderId[] = ['gemini', 'groq', 'openai', 'anthropic', 'deepseek', 'zai', 'huggingface'];

export const PROVIDER_LABELS: Record<ProviderId, string> = {
    gemini: 'Google Gemini',
    groq: 'Groq',
    openai: 'OpenAI',
    anthropic: 'Anthropic Claude',
    deepseek: 'DeepSeek',
    zai: 'Z.ai (GLM)',
    huggingface: 'Hugging Face',
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
    huggingface: {
        // HF Inference Providers router — OpenAI-compatible, free monthly
        // credits with any hf_ token. Model ids are hub ids.
        url: 'https://router.huggingface.co/v1/chat/completions',
        dialect: 'openai',
        defaultModel: 'meta-llama/Llama-3.3-70B-Instruct',
        supportsJsonMode: false,
        envPrefix: 'HUGGINGFACE',
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
    /** legacy (chain mode) — no longer used for selection, kept for old files */
    order?: string[];
    /**
     * THE provider that powers the resume engine. Exactly one at a time —
     * no fallback chain (owner's explicit preference, mirroring BYOK chat).
     */
    activeProvider?: ProviderId | null;
    providers?: Partial<Record<ProviderId, {
        enabled?: boolean;
        model?: string;
        keys?: string[];
        /** false → ignore environment-variable keys for this provider */
        useEnvKeys?: boolean;
    }>>;
}

const CONFIG_FILE = path.join(process.cwd(), 'data', 'ai-providers.json');

// =============================================================================
// KV PERSISTENCE (Upstash Redis REST — optional)
// Vercel's filesystem is read-only, so admin-saved provider config evaporates
// there. When UPSTASH_REDIS_REST_URL/TOKEN are set (free tier, 2-click Vercel
// integration), config persists in Redis and survives deploys + cold starts.
// Falls back to the JSON file when KV is not configured (local dev).
// =============================================================================

const KV_KEY = 'srujan:ai-providers-config';
const KV_TTL_MS = 30_000; // re-read from KV at most every 30s

let kvCache: AIProvidersFile | null = null; // null = nothing stored in KV
let kvFetchedAt = 0;

// The Vercel ↔ Upstash integration may inject the credentials under either
// the Upstash-native names (UPSTASH_REDIS_REST_*) or the Vercel-KV names
// (KV_REST_API_*). Accept both so connecting the store is genuinely two clicks.
function kvUrl(): string | undefined {
    return process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
}
function kvToken(): string | undefined {
    return process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
}

export function kvConfigAvailable(): boolean {
    return !!(kvUrl() && kvToken());
}

async function kvCommand(cmd: unknown[]): Promise<unknown> {
    const res = await fetch(kvUrl()!, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${kvToken()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cmd),
    });
    if (!res.ok) throw new Error(`KV ${res.status}: ${await res.text().catch(() => '')}`);
    const data = await res.json() as { result?: unknown };
    return data.result;
}

/** Generic JSON get/set on the optional Upstash store (shared by other libs). */
export async function kvGetJSON<T>(key: string): Promise<T | null> {
    if (!kvConfigAvailable()) return null;
    try {
        const raw = await kvCommand(['GET', key]);
        return typeof raw === 'string' && raw ? JSON.parse(raw) as T : null;
    } catch {
        return null;
    }
}

export async function kvSetJSON(key: string, value: unknown): Promise<boolean> {
    if (!kvConfigAvailable()) return false;
    try {
        await kvCommand(['SET', key, JSON.stringify(value)]);
        return true;
    } catch {
        return false;
    }
}

/**
 * Pull the latest config from KV into the in-memory snapshot. Call at the top
 * of any async entry point that reads provider config (sync readers then see
 * the fresh snapshot). No-op when KV isn't configured.
 */
export async function hydrateConfigFromKV(force = false): Promise<void> {
    if (!kvConfigAvailable()) return;
    if (!force && Date.now() - kvFetchedAt < KV_TTL_MS) return;
    try {
        const raw = await kvCommand(['GET', KV_KEY]);
        kvCache = typeof raw === 'string' && raw ? JSON.parse(raw) as AIProvidersFile : null;
        kvFetchedAt = Date.now();
    } catch (e) {
        console.warn('KV hydrate failed (using file/env config):', e instanceof Error ? e.message : e);
    }
}

function readConfigFile(): AIProvidersFile {
    // KV snapshot wins when present (it is the durable store in production)
    if (kvCache !== null) return kvCache;
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) as AIProvidersFile;
    } catch {
        return {};
    }
}

/**
 * Persist config. KV first (durable everywhere), file as local-dev convenience.
 * Returns where it landed so the admin UI can say so.
 */
export async function writeConfig(cfg: AIProvidersFile): Promise<'kv' | 'file'> {
    if (kvConfigAvailable()) {
        await kvCommand(['SET', KV_KEY, JSON.stringify(cfg)]);
        kvCache = cfg;
        kvFetchedAt = Date.now();
        try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2)); } catch { /* read-only FS — KV is the store */ }
        return 'kv';
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2)); // throws on read-only FS
    return 'file';
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

/** Display order for the admin UI (fixed — selection is via activeProvider). */
export function getProviderOrder(): ProviderId[] {
    return PROVIDER_IDS;
}

/**
 * The single provider the resume engine runs on.
 * Resolution: explicit admin choice > AI_PROVIDER env > first READY provider.
 * Returns null when nothing is usable (engine then runs deterministically).
 */
export function resolveActiveProvider(): ProviderId | null {
    const file = readConfigFile();
    const chosen = file.activeProvider;
    if (chosen && PROVIDER_IDS.includes(chosen)) return chosen;
    const fromEnv = (process.env.AI_PROVIDER || '').trim() as ProviderId;
    if (fromEnv && PROVIDER_IDS.includes(fromEnv)) return fromEnv;
    // no explicit choice — first provider that's actually ready
    for (const id of PROVIDER_IDS) {
        const cfg = getProviderConfig(id);
        if (cfg.enabled && cfg.keys.length > 0) return id;
    }
    return null;
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
 * Generate text using EXACTLY ONE provider:
 * - req.provider when forced (BYOK chat always forces the visitor's choice)
 * - otherwise the admin-selected active provider (resume engine)
 * No silent fallback to other providers — failures surface honestly and the
 * caller's deterministic path takes over.
 */
export async function generateText(req: LLMRequest): Promise<LLMResult> {
    await hydrateConfigFromKV(); // pick up admin changes made from any instance
    const id = req.provider || resolveActiveProvider();
    if (!id) throw new Error('No AI provider configured');
    const out = await callProvider(id, req);
    if (out.ok) return out.result;
    throw new Error(out.error);
}

/** True when the resolved single provider is ready (enabled + has keys). */
export function hasAnyProvider(): boolean {
    const id = resolveActiveProvider();
    if (!id) return false;
    const c = getProviderConfig(id);
    return c.enabled && c.keys.length > 0;
}

// =============================================================================
// TRUE TOKEN STREAMING
// Same provider resolution and retry rules as generateText, but the reply
// streams as it is generated — first token in well under a second instead of
// waiting for the whole completion. OpenAI-dialect and Anthropic both speak
// SSE; we normalize their event formats into one ReadableStream<string>.
// =============================================================================

function parseProviderSSE(body: ReadableStream<Uint8Array>, dialect: 'openai' | 'anthropic'): ReadableStream<string> {
    const decoder = new TextDecoder();
    let buffer = '';
    return new ReadableStream<string>({
        async start(controller) {
            const reader = body.getReader();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    // normalize CRLF so event splitting works on any transport
                    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
                    const events = buffer.split('\n\n');
                    buffer = events.pop() || '';
                    for (const ev of events) {
                        const dataLine = ev.split('\n').find(l => l.startsWith('data:'));
                        if (!dataLine) continue;
                        const json = dataLine.slice(5).trim();
                        if (!json || json === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(json) as Record<string, unknown>;
                            let text: string | undefined;
                            if (dialect === 'openai') {
                                const choices = parsed.choices as Array<{ delta?: { content?: string } }> | undefined;
                                text = choices?.[0]?.delta?.content;
                            } else {
                                // anthropic: content_block_delta events carry text_delta
                                const delta = parsed.delta as { type?: string; text?: string } | undefined;
                                if (parsed.type === 'content_block_delta' && delta?.type === 'text_delta') text = delta.text;
                            }
                            if (text) controller.enqueue(text);
                        } catch { /* skip malformed event */ }
                    }
                }
                controller.close();
            } catch (e) {
                controller.error(e);
            }
        },
    });
}

export interface StreamResult {
    stream: ReadableStream<string>;
    provider: ProviderId;
    model: string;
}

export async function generateTextStream(req: LLMRequest): Promise<StreamResult> {
    await hydrateConfigFromKV();
    const id = req.provider || resolveActiveProvider();
    if (!id) throw new Error('No AI provider configured');

    const spec = SPECS[id];
    const isByok = !!req.overrideKey;
    const cfg = getProviderConfig(id);
    if (!isByok && (!cfg.enabled || cfg.keys.length === 0)) throw new Error(`${id}: no keys / disabled`);
    const keys = isByok ? [req.overrideKey!] : cfg.keys;
    const model = req.overrideModel || cfg.model;

    let lastError = '';
    let overloadRetries = 0;
    const attempts = Math.min(keys.length, 3) + 2;
    for (let i = 0; i < attempts; i++) {
        const key = isByok ? keys[0] : nextKey(keys);
        if (!key) { lastError = `${id}: all keys cooling down`; break; }
        try {
            let response: Response;
            if (spec.dialect === 'anthropic') {
                response = await fetch(spec.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
                    body: JSON.stringify({
                        model,
                        max_tokens: req.maxTokens ?? 2048,
                        temperature: req.temperature ?? 0.7,
                        stream: true,
                        ...(req.system ? { system: req.system } : {}),
                        messages: [
                            ...(req.messages || []).map(m => ({ role: m.role, content: m.content })),
                            { role: 'user', content: req.prompt },
                        ],
                    }),
                });
            } else {
                response = await fetch(spec.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
                    body: JSON.stringify({
                        model,
                        stream: true,
                        messages: [
                            ...(req.system ? [{ role: 'system', content: req.system }] : []),
                            ...(req.messages || []).map(m => ({ role: m.role, content: m.content })),
                            { role: 'user', content: req.prompt },
                        ],
                        temperature: req.temperature ?? 0.7,
                        max_tokens: req.maxTokens ?? 2048,
                        ...(spec.extraBody || {}),
                    }),
                });
            }

            if (response.ok && response.body) {
                if (!isByok) keyCooldowns.delete(key);
                return { stream: parseProviderSSE(response.body, spec.dialect), provider: id, model };
            }

            const status = response.status;
            const errText = await response.text().catch(() => response.statusText);
            lastError = `${id} ${status}: ${errText.slice(0, 300)}`;
            if (status === 429) {
                if (isByok) break;
                coolKey(key);
                continue;
            }
            if (status === 401 || status === 403) {
                if (isByok) { lastError = `${id} ${status}: API key rejected`; break; }
                coolKey(key, 10 * 60_000);
                continue;
            }
            if (status >= 500) {
                overloadRetries++;
                if (overloadRetries <= 2) { await new Promise(r => setTimeout(r, 1200 * overloadRetries)); continue; }
                break;
            }
            break;
        } catch (e) {
            lastError = `${id} network: ${e instanceof Error ? e.message : 'error'}`;
        }
    }
    throw new Error(lastError || `${id}: stream failed`);
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
    await hydrateConfigFromKV();
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
