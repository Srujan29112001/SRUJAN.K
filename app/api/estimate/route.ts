import { NextRequest, NextResponse } from 'next/server';
import { calculateEstimate, formatPrice, projectTypes, complexityLevels, features } from '@/data/project-estimates';

interface EstimateRequest {
    projectType: string;
    complexity: string;
    selectedFeatures: string[];
    currency?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: EstimateRequest = await request.json();
        const { projectType, complexity, selectedFeatures, currency = 'USD' } = body;

        // Validate inputs
        if (!projectType || !complexity) {
            return NextResponse.json(
                { error: 'Project type and complexity are required' },
                { status: 400 }
            );
        }

        // Validate project type
        const validProjectType = projectTypes.find(p => p.id === projectType);
        if (!validProjectType) {
            return NextResponse.json(
                { error: 'Invalid project type' },
                { status: 400 }
            );
        }

        // Validate complexity
        const validComplexity = complexityLevels.find(c => c.id === complexity);
        if (!validComplexity) {
            return NextResponse.json(
                { error: 'Invalid complexity level' },
                { status: 400 }
            );
        }

        // Validate features
        const validFeatures = selectedFeatures.filter(f =>
            features.some(feature => feature.id === f)
        );

        // Calculate estimate
        const estimate = calculateEstimate(projectType, complexity, validFeatures);

        // Get feature details
        const featureDetails = validFeatures.map(id => {
            const feature = features.find(f => f.id === id);
            return feature ? {
                id: feature.id,
                name: feature.name,
                priceAdd: feature.priceAdd,
                weeksAdd: feature.weeksAdd,
            } : null;
        }).filter(Boolean);

        // Build response
        const response = {
            success: true,
            estimate: {
                ...estimate,
                priceMinFormatted: formatPrice(estimate.priceMin, currency),
                priceMaxFormatted: formatPrice(estimate.priceMax, currency),
                timelineFormatted: `${estimate.weeksMin}-${estimate.weeksMax} weeks`,
            },
            details: {
                projectType: {
                    id: validProjectType.id,
                    name: validProjectType.name,
                    icon: validProjectType.icon,
                },
                complexity: {
                    id: validComplexity.id,
                    name: validComplexity.name,
                    multiplier: validComplexity.multiplier,
                },
                features: featureDetails,
            },
            disclaimer: 'This is an estimated range. Actual costs may vary based on specific requirements, existing codebase, and other factors discussed during consultation.',
            nextSteps: [
                'Book a consultation call for detailed discussion',
                'Prepare a brief project description',
                'List any specific technologies or constraints',
            ],
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Estimate API error:', error);

        return NextResponse.json(
            { error: 'Failed to calculate estimate' },
            { status: 500 }
        );
    }
}

// Get available options for the calculator
export async function GET() {
    return NextResponse.json({
        projectTypes: projectTypes.map(p => ({
            id: p.id,
            name: p.name,
            icon: p.icon,
            description: p.description,
        })),
        complexityLevels: complexityLevels.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
        })),
        features: features.map(f => ({
            id: f.id,
            name: f.name,
            description: f.description,
            priceAdd: f.priceAdd,
            weeksAdd: f.weeksAdd,
        })),
    });
}
