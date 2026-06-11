import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { addCustomDoc, deleteCustomDoc, getCustomDocs, hydrateCustomKnowledge } from '@/lib/custom-knowledge';
import { parseDocument } from '@/lib/document-parser';

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

// GET - list owner-fed docs
export async function GET() {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await hydrateCustomKnowledge(true);
    return NextResponse.json({
        docs: getCustomDocs().map(d => ({
            id: d.id, title: d.title, tags: d.tags, sourceFile: d.sourceFile,
            createdAt: d.createdAt, chars: d.content.length,
            preview: d.content.slice(0, 160),
        })),
    });
}

// POST - add knowledge. Two modes:
//   JSON  { title, content, tags? }          — pasted text
//   multipart/form-data { file, title?, tags? } — PDF / DOCX / TXT / MD upload
export async function POST(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const form = await request.formData();
            const file = form.get('file');
            if (!(file instanceof File)) {
                return NextResponse.json({ error: 'No file provided' }, { status: 400 });
            }
            if (file.size > 10 * 1024 * 1024) {
                return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
            }
            const name = file.name || 'upload';
            const ext = path.extname(name).toLowerCase();
            const title = String(form.get('title') || '').trim() || name.replace(/\.[^.]+$/, '');
            const tags = String(form.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean);

            let content: string;
            if (ext === '.txt' || ext === '.md') {
                content = (await file.text()).slice(0, 40_000);
            } else if (ext === '.pdf' || ext === '.docx' || ext === '.doc') {
                // parse via temp file (parser reads from disk; tmpdir is writable on Vercel)
                const tmp = path.join(os.tmpdir(), `ck-${Date.now()}${ext}`);
                fs.writeFileSync(tmp, Buffer.from(await file.arrayBuffer()));
                try {
                    const parsed = await parseDocument(tmp);
                    if (!parsed) {
                        return NextResponse.json(
                            { error: 'Could not extract text from this file (scanned PDFs/images need OCR — paste the text instead).' },
                            { status: 422 },
                        );
                    }
                    content = parsed.content;
                } finally {
                    try { fs.unlinkSync(tmp); } catch { /* tmp cleanup best-effort */ }
                }
            } else {
                return NextResponse.json(
                    { error: `Unsupported file type "${ext}". Use PDF, DOCX, TXT or MD — for images, paste a written description instead.` },
                    { status: 400 },
                );
            }

            if (content.trim().length < 40) {
                return NextResponse.json({ error: 'Extracted text is too short to be useful.' }, { status: 422 });
            }

            const { doc, persistedTo } = await addCustomDoc({ title, content, tags, sourceFile: name });
            return NextResponse.json({ success: true, doc: { id: doc.id, title: doc.title, chars: doc.content.length }, persistedTo });
        }

        // JSON text mode
        const body = await request.json() as { title?: string; content?: string; tags?: string[] };
        const title = (body.title || '').trim();
        const content = (body.content || '').trim();
        if (title.length < 3) return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
        if (content.length < 20) return NextResponse.json({ error: 'Content must be at least 20 characters' }, { status: 400 });

        const { doc, persistedTo } = await addCustomDoc({ title, content, tags: body.tags });
        return NextResponse.json({ success: true, doc: { id: doc.id, title: doc.title, chars: doc.content.length }, persistedTo });
    } catch (e) {
        console.error('Custom knowledge add failed:', e);
        const msg = e instanceof Error && /EROFS|read-only/i.test(e.message)
            ? 'Read-only filesystem and no KV store — connect Upstash Redis in Vercel for durable saves, or add docs from a local dev session.'
            : 'Failed to add knowledge';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// DELETE ?id=...
export async function DELETE(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const ok = await deleteCustomDoc(id);
    return NextResponse.json({ success: ok });
}
