export interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    content: string;
    image: string;
}

export const testimonials: Testimonial[] = [
    {
        id: 't1',
        name: 'Sarah Chen',
        role: 'CTO',
        company: 'FinTech Innovations (USA)',
        content: "Srujan's work on the Finance Copilot was nothing short of transformative. He didn't just build an app; he architected a scalable intelligence layer that our traders rely on daily.",
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
        id: 't2',
        name: 'Rajesh Kumar',
        role: 'Founder',
        company: 'MediCare AI',
        content: "The Clinical AI Copilot he delivered has 95% accuracy. His understanding of HIPAA compliance along with cutting-edge GraphRAG tech is a rare combination.",
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    },
    {
        id: 't3',
        name: 'David Miller',
        role: 'Product Lead',
        company: 'AeroSpace DY',
        content: "We hired him for a simple dashboard, but he gave us a full 3D orbital tracking system. His passion for the domain is infectious.",
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
    {
        id: 't4',
        name: 'Emily Zhang',
        role: 'CEO',
        company: 'Wellness Tech',
        content: "He bridged the gap between ancient Ayurvedic wisdom and modern AI seamlessly. A true polymath engineer.",
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    },
    {
        id: 't5',
        name: 'Michael Ross',
        role: 'Director',
        company: 'EduLearn Inc.',
        content: "Fast, reliable, and incredibly innovative. The multi-agent system he built manages our entire content pipeline automatically.",
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    },
];
