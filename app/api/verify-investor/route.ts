import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

const CLIENTS_FILE = path.join(process.cwd(), 'data', 'clients.json');

// Read clients from JSON file
function getClients(): Client[] {
    try {
        const data = fs.readFileSync(CLIENTS_FILE, 'utf-8');
        const parsed: ClientsData = JSON.parse(data);
        return parsed.clients || [];
    } catch {
        return [];
    }
}

// Find client by email
function findClientByEmail(email: string): Client | undefined {
    const clients = getClients();
    const normalizedEmail = email.toLowerCase().trim();
    return clients.find(
        (client) => client.email.toLowerCase() === normalizedEmail
    );
}

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        const client = findClientByEmail(email);

        if (client) {
            // Check if name matches (optional additional verification)
            const nameMatches = client.name.toLowerCase().includes(name?.toLowerCase() || '');

            return NextResponse.json({
                success: true,
                verified: true,
                investor: {
                    name: client.name,
                    amount: client.amount,
                    currency: client.currency,
                    paymentLink: client.paymentLink || undefined,
                },
                nameMatch: nameMatches,
            });
        }

        return NextResponse.json({
            success: true,
            verified: false,
            message: 'Email not found in verified investors database',
        });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { success: false, message: 'Verification failed' },
            { status: 500 }
        );
    }
}
