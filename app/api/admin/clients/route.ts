import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const SESSION_NAME = 'admin_session';
const SESSION_VALUE = 'authenticated';
const CLIENTS_FILE = path.join(process.cwd(), 'data', 'clients.json');

interface Client {
    id: string;
    email: string;
    name: string;
    amount: number;
    currency: string;
    paymentLink: string;
    createdAt: string;
}

interface ClientsData {
    clients: Client[];
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

// Read clients from JSON file
function getClients(): ClientsData {
    try {
        const data = fs.readFileSync(CLIENTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { clients: [] };
    }
}

// Write clients to JSON file
function saveClients(data: ClientsData): void {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(data, null, 2));
}

// GET - List all clients
export async function GET() {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = getClients();
    return NextResponse.json(data);
}

// POST - Add new client
export async function POST(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { email, name, amount, currency, paymentLink } = await request.json();

        // Validate required fields
        if (!email || !name || !amount || !currency || !paymentLink) {
            return NextResponse.json(
                { error: 'Missing required fields (email, name, amount, currency, paymentLink)' },
                { status: 400 }
            );
        }

        const data = getClients();

        // Check if email already exists
        if (data.clients.some(c => c.email.toLowerCase() === email.toLowerCase())) {
            return NextResponse.json(
                { error: 'Client with this email already exists' },
                { status: 400 }
            );
        }

        // Create new client
        const newClient: Client = {
            id: Date.now().toString(),
            email: email.toLowerCase().trim(),
            name: name.trim(),
            amount: parseFloat(amount),
            currency: currency.toLowerCase(),
            paymentLink: paymentLink?.trim() || '',
            createdAt: new Date().toISOString(),
        };

        data.clients.push(newClient);
        saveClients(data);

        return NextResponse.json({ success: true, client: newClient });
    } catch (error) {
        console.error('Error adding client:', error);
        return NextResponse.json(
            { error: 'Failed to add client' },
            { status: 500 }
        );
    }
}

// DELETE - Remove client by ID (via query param)
export async function DELETE(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Client ID is required' },
                { status: 400 }
            );
        }

        const data = getClients();
        const initialLength = data.clients.length;
        data.clients = data.clients.filter(c => c.id !== id);

        if (data.clients.length === initialLength) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            );
        }

        saveClients(data);
        return NextResponse.json({ success: true, message: 'Client removed' });
    } catch (error) {
        console.error('Error removing client:', error);
        return NextResponse.json(
            { error: 'Failed to remove client' },
            { status: 500 }
        );
    }
}
