import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWFDL9Enb99KFU0Y7Pdew6Dx9oFpMdIibDNX3PRTlxVIUSMwtNVamUiIgdZ_3jckyg/exec';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.email || !body.message) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Send to Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: body.name,
                email: body.email,
                message: body.message,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to submit to Google Sheets');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit form' },
            { status: 500 }
        );
    }
}
