/**
 * =============================================================================
 * KNOWLEDGE BASE BUILDER - Educational RAG Component
 * =============================================================================
 * 
 * 🎓 WHAT IS A KNOWLEDGE BASE?
 * ----------------------------
 * A knowledge base is a structured collection of information that an AI system
 * can search through to find relevant context when answering questions.
 * 
 * Think of it like a library:
 * - 📚 Each "document" is like a book page with specific information
 * - 🏷️ Each document has "metadata" (tags) describing what it contains
 * - 🔍 When you ask a question, the system searches for relevant pages
 * 
 * 
 * 🧩 HOW RAG (Retrieval-Augmented Generation) WORKS:
 * --------------------------------------------------
 * 
 * Traditional LLM:
 *   User Question → LLM → Response (based only on training data)
 * 
 * RAG-Enhanced LLM:
 *   User Question → Search Knowledge Base → Get Relevant Context → LLM → Response
 *                   ↓
 *   "Find similar documents using vector embeddings"
 * 
 * 
 * 📐 VECTOR EMBEDDINGS EXPLAINED:
 * -------------------------------
 * Embeddings convert text into numbers (vectors) that capture meaning.
 * 
 * Example:
 *   "I love cats" → [0.2, 0.8, 0.1, 0.5, ...]  (768 numbers)
 *   "I adore kittens" → [0.21, 0.79, 0.12, 0.48, ...]  (similar numbers!)
 *   "The stock market crashed" → [0.9, 0.1, 0.7, 0.2, ...]  (very different!)
 * 
 * Similar meanings = Similar vectors = Can be compared mathematically!
 * 
 * 
 * 📄 THIS FILE'S PURPOSE:
 * -----------------------
 * This file takes your portfolio data (projects, skills, experience) and
 * converts it into "documents" that can be embedded and searched.
 * 
 * Each document is a chunk of text with metadata for context.
 * =============================================================================
 */

import { projects } from '@/data/projects';
import { skillCategories } from '@/data/skills';
import { experiences } from '@/data/experience';
import { aiPersona } from '@/data/ai-persona';
import { personalKnowledgeBase } from '@/data/personal-profile';
import { lifeKnowledgeBase } from '@/data/life-knowledge';
import { mediaKnowledgeBase } from '@/data/media-knowledge';

/**
 * Document structure for the knowledge base
 * 
 * 🎓 WHY THIS STRUCTURE?
 * - id: Unique identifier for each document
 * - content: The actual text that gets embedded
 * - metadata: Extra info for filtering and context in responses
 * - type: Category of document (helps with targeted searches)
 */
export interface KnowledgeDocument {
    id: string;
    content: string;
    metadata: {
        title: string;
        type: 'project' | 'skill' | 'experience' | 'persona';
        category?: string;
        tags?: string[];
        source?: string;
    };
}

/**
 * 🎓 CHUNKING STRATEGY
 * --------------------
 * We create separate documents for different types of information.
 * This allows:
 * - More precise retrieval (find exactly what's relevant)
 * - Better context (each chunk is focused on one topic)
 * - Smaller embeddings (less noise in the vectors)
 * 
 * Too large chunks = Too much irrelevant info included
 * Too small chunks = Loses important context
 * Sweet spot = One logical unit of information per document
 */

/**
 * Build knowledge documents from projects
 * Each project becomes 1-2 documents (basic info + detailed description)
 */
function buildProjectDocuments(): KnowledgeDocument[] {
    const documents: KnowledgeDocument[] = [];

    for (const project of projects) {
        // Primary document: Main project info
        const primaryContent = `
Project: ${project.title}
Category: ${project.category}
Technologies: ${project.tech.join(', ')}
Description: ${project.description}
${project.longDescription ? `Details: ${project.longDescription}` : ''}
${project.metric ? `Key Metric: ${project.metric}` : ''}
${project.year ? `Year: ${project.year}` : ''}
${project.role ? `Role: ${project.role}` : ''}
    `.trim();

        documents.push({
            id: `project-${project.id}`,
            content: primaryContent,
            metadata: {
                title: project.title,
                type: 'project',
                category: project.category,
                tags: project.tech,
                source: 'projects.ts',
            },
        });
    }

    return documents;
}

/**
 * Build knowledge documents from skills
 * Each skill category becomes one document
 */
function buildSkillDocuments(): KnowledgeDocument[] {
    const documents: KnowledgeDocument[] = [];

    for (const category of skillCategories) {
        const skillsList = category.skills
            .map(s => `- ${s.name}: ${s.proficiency}% proficiency${s.details ? ` (${s.details})` : ''}`)
            .join('\n');

        const content = `
Skill Category: ${category.title}
Description: ${category.description}

Skills:
${skillsList}
    `.trim();

        documents.push({
            id: `skills-${category.id}`,
            content,
            metadata: {
                title: category.title,
                type: 'skill',
                category: category.id,
                tags: category.skills.map(s => s.name),
                source: 'skills.ts',
            },
        });
    }

    // Also create individual skill documents for precise matching
    for (const category of skillCategories) {
        for (const skill of category.skills) {
            documents.push({
                id: `skill-${category.id}-${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
                content: `Skill: ${skill.name}. Category: ${category.title}. Proficiency: ${skill.proficiency}%. ${skill.details || ''}`,
                metadata: {
                    title: skill.name,
                    type: 'skill',
                    category: category.id,
                    tags: [skill.name, category.title],
                    source: 'skills.ts',
                },
            });
        }
    }

    return documents;
}

/**
 * Build knowledge documents from experience
 */
function buildExperienceDocuments(): KnowledgeDocument[] {
    const documents: KnowledgeDocument[] = [];

    for (const exp of experiences) {
        const highlights = exp.highlights.map(h => `- ${h}`).join('\n');

        const content = `
Experience: ${exp.title} at ${exp.organization}
Period: ${exp.period}
Type: ${exp.type}
Description: ${exp.description}

Highlights:
${highlights}
    `.trim();

        documents.push({
            id: `experience-${exp.id}`,
            content,
            metadata: {
                title: `${exp.title} at ${exp.organization}`,
                type: 'experience',
                category: exp.type,
                tags: [exp.organization, exp.type],
                source: 'experience.ts',
            },
        });
    }

    return documents;
}

/**
 * Build knowledge documents from AI persona
 * This helps the AI understand and articulate Srujan's personality and approach
 */
function buildPersonaDocuments(): KnowledgeDocument[] {
    const documents: KnowledgeDocument[] = [];

    // Identity document
    documents.push({
        id: 'persona-identity',
        content: `
About Srujan:
Name: ${aiPersona.identity.fullName}
Role: ${aiPersona.identity.role}
Tagline: ${aiPersona.identity.tagline}
Location: ${aiPersona.identity.location}

Personality Traits: ${aiPersona.personality.traits.join(', ')}
Communication Style: ${aiPersona.personality.communicationStyle.join(', ')}
    `.trim(),
        metadata: {
            title: 'About Srujan',
            type: 'persona',
            tags: ['identity', 'about', 'bio'],
            source: 'ai-persona.ts',
        },
    });

    // Expertise document
    documents.push({
        id: 'persona-expertise',
        content: `
Srujan's Areas of Expertise:

Primary Expertise: ${aiPersona.expertise.primary.join(', ')}
Secondary Skills: ${aiPersona.expertise.secondary.join(', ')}
Research Interests: ${aiPersona.expertise.interests.join(', ')}
    `.trim(),
        metadata: {
            title: 'Expertise Areas',
            type: 'persona',
            tags: ['expertise', 'skills', 'interests'],
            source: 'ai-persona.ts',
        },
    });

    // Problem-solving approach
    documents.push({
        id: 'persona-approach',
        content: `
How Srujan Approaches Problems:
${aiPersona.problemSolvingApproach}
    `.trim(),
        metadata: {
            title: 'Problem-Solving Approach',
            type: 'persona',
            tags: ['methodology', 'approach', 'work style'],
            source: 'ai-persona.ts',
        },
    });

    // Current work
    documents.push({
        id: 'persona-current-work',
        content: `
Srujan's Current Work and Ideas:

Current Projects: ${aiPersona.currentWork.projects.join(', ')}
Exploring Ideas: ${aiPersona.currentWork.ideas.join(', ')}
    `.trim(),
        metadata: {
            title: 'Current Work',
            type: 'persona',
            tags: ['current', 'projects', 'ideas'],
            source: 'ai-persona.ts',
        },
    });

    return documents;
}

/**
 * Build knowledge documents from comprehensive personal profile
 * This includes detailed identity, education, experience, personality, and spiritual practice
 */
function buildPersonalProfileDocuments(): KnowledgeDocument[] {
    const documents: KnowledgeDocument[] = [];

    // Add each section from the personal profile
    for (const section of personalKnowledgeBase.sections) {
        documents.push({
            id: `profile-${section.id}`,
            content: `${section.title}:\n${section.content}`,
            metadata: {
                title: section.title,
                type: 'persona',
                tags: section.id.split('-'),
                source: 'personal-profile.ts',
            },
        });
    }

    // Add RAG guidelines as a special document
    const guidelinesContent = `
RAG Guidelines for AI Clone:

Voice & Tone:
${personalKnowledgeBase.ragGuidelines.voiceAndTone.map(v => `- ${v}`).join('\n')}

Key Phrases to Use:
${personalKnowledgeBase.ragGuidelines.keyPhrases.map(p => `- "${p}"`).join('\n')}

Decision Framework:
${personalKnowledgeBase.ragGuidelines.decisionFramework.map(d => `- ${d}`).join('\n')}

Sensitive Topics:
${personalKnowledgeBase.ragGuidelines.sensitiveTopics.map(t => `- ${t.topic}: ${t.guidance}`).join('\n')}
    `.trim();

    documents.push({
        id: 'profile-rag-guidelines',
        content: guidelinesContent,
        metadata: {
            title: 'RAG Guidelines',
            type: 'persona',
            tags: ['guidelines', 'voice', 'tone', 'communication'],
            source: 'personal-profile.ts',
        },
    });

    return documents;
}

/**
 * 🎯 MAIN FUNCTION: Build the complete knowledge base
 * 
 * This combines all document sources into one searchable collection.
 * Call this once at startup to prepare documents for embedding.
 */
export function buildKnowledgeBase(): KnowledgeDocument[] {
    const personalProfileDocs = buildPersonalProfileDocuments();
    const lifeDocs = buildLifeDocuments();
    const mediaDocs = buildMediaDocuments();

    const documents: KnowledgeDocument[] = [
        ...buildProjectDocuments(),
        ...buildSkillDocuments(),
        ...buildExperienceDocuments(),
        ...buildPersonaDocuments(),
        ...personalProfileDocs,
        ...lifeDocs,
        ...mediaDocs,
    ];

    console.log(`📚 Knowledge base built: ${documents.length} documents`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`   - Skill categories: ${skillCategories.length}`);
    console.log(`   - Experience entries: ${experiences.length}`);
    console.log(`   - Persona documents: 4`);
    console.log(`   - Personal profile sections: ${personalProfileDocs.length}`);
    console.log(`   - Life knowledge sections: ${lifeDocs.length}`);
    console.log(`   - Media knowledge sections: ${mediaDocs.length}`);

    return documents;
}

/**
 * Build knowledge documents from life knowledge base
 * Covers personal life, likes/dislikes, interests, freelancing, audience handling
 */
function buildLifeDocuments(): KnowledgeDocument[] {
    const documents: KnowledgeDocument[] = [];

    for (const section of lifeKnowledgeBase.sections) {
        documents.push({
            id: `life-${section.id}`,
            content: `${section.title}:\n${section.content}`,
            metadata: {
                title: section.title,
                type: 'persona',
                tags: section.id.split('-'),
                source: 'life-knowledge.ts',
            },
        });
    }

    return documents;
}

/**
 * Build knowledge documents from media knowledge base
 * Covers music preferences, learning content, entertainment, spiritual content, etc.
 */
function buildMediaDocuments(): KnowledgeDocument[] {
    const documents: KnowledgeDocument[] = [];

    for (const section of mediaKnowledgeBase.sections) {
        documents.push({
            id: `media-${section.id}`,
            content: `${section.title}:\n${section.content}`,
            metadata: {
                title: section.title,
                type: 'persona',
                tags: section.id.split('-'),
                source: 'media-knowledge.ts',
            },
        });
    }

    return documents;
}

/**
 * Get a summary of the knowledge base (useful for debugging)
 */
export function getKnowledgeBaseSummary(): {
    total: number;
    byType: Record<string, number>;
} {
    const documents = buildKnowledgeBase();
    const byType: Record<string, number> = {};

    for (const doc of documents) {
        byType[doc.metadata.type] = (byType[doc.metadata.type] || 0) + 1;
    }

    return { total: documents.length, byType };
}
