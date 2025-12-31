/**
 * =============================================================================
 * EMBEDDING GENERATION SCRIPT
 * =============================================================================
 *
 * Run this script to pre-generate embeddings for all knowledge base documents.
 * This caches the embeddings so the API doesn't need to generate them on startup.
 *
 * Usage (from srujan-portfolio folder):
 *   npx tsx scripts/generate-embeddings.ts
 *
 * Note: Requires GEMINI_API_KEY to be set in .env.local
 * =============================================================================
 */

// Use require for CommonJS compatibility
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Import the knowledge base data directly
const projectsData = require('../data/projects');
const skillsData = require('../data/skills');
const experienceData = require('../data/experience');
const personaData = require('../data/ai-persona');
const personalProfileData = require('../data/personal-profile');
const lifeKnowledgeData = require('../data/life-knowledge');
const mediaKnowledgeData = require('../data/media-knowledge');
const projectEstimatesData = require('../data/project-estimates');
const testimonialsData = require('../data/testimonials');

// Document parsing libraries
let pdfjsLib: any = null;
let mammoth: any = null;

// Project documents folder
const PROJECT_DOCS_FOLDER = path.join(process.cwd(), 'public', 'Projects_doc_pdf and word');

const EMBEDDING_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';

// =============================================================================
// DOCUMENT PARSING HELPERS
// =============================================================================

async function loadPdfParser() {
    if (!pdfjsLib) {
        pdfjsLib = require('pdfjs-dist');
    }
    return pdfjsLib;
}

async function loadMammoth() {
    if (!mammoth) {
        mammoth = require('mammoth');
    }
    return mammoth;
}

async function parsePdf(filePath: string): Promise<string> {
    const pdfjs = await loadPdfParser();
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(dataBuffer);

    // Load the PDF document
    const loadingTask = pdfjs.getDocument({
        data: uint8Array,
        useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;

    // Extract text from all pages
    const textParts: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: { str?: string }) => item.str || '')
            .join(' ');
        textParts.push(pageText);
    }

    return textParts.join('\n\n');
}

async function parseDocx(filePath: string): Promise<string> {
    const parser = await loadMammoth();
    const dataBuffer = fs.readFileSync(filePath);
    const result = await parser.extractRawText({ buffer: dataBuffer });
    return result.value;
}

function cleanText(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .replace(/Page \d+ of \d+/gi, '')
        .replace(/^\d+\s*$/gm, '')
        .replace(/\x00/g, '')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function generateTitle(filename: string): string {
    let title = filename.replace(/\.(pdf|docx|doc)$/i, '');
    title = title.replace(/[_-]/g, ' ');
    title = title.replace(/\s+/g, ' ').trim();
    title = title.split(' ').map(word => {
        if (word.length <= 2) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    return title;
}

function truncateContent(content: string, maxLength: number = 2500): string {
    if (content.length <= maxLength) return content;
    const truncated = content.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');
    const cutPoint = Math.max(lastPeriod, lastNewline);
    if (cutPoint > maxLength * 0.7) {
        return truncated.substring(0, cutPoint + 1) + '...';
    }
    return truncated + '...';
}

interface ParsedDocument {
    filename: string;
    title: string;
    content: string;
    type: 'pdf' | 'docx' | 'doc';
    wordCount: number;
}

async function parseProjectDocuments(): Promise<ParsedDocument[]> {
    const documents: ParsedDocument[] = [];

    if (!fs.existsSync(PROJECT_DOCS_FOLDER)) {
        console.log(`   ⚠️ Project docs folder not found: ${PROJECT_DOCS_FOLDER}`);
        return documents;
    }

    const files = fs.readdirSync(PROJECT_DOCS_FOLDER);
    const supportedExtensions = ['.pdf', '.docx', '.doc'];

    const documentFiles = files.filter((file: string) =>
        supportedExtensions.includes(path.extname(file).toLowerCase())
    );

    console.log(`   Found ${documentFiles.length} project document files to parse...`);

    for (const file of documentFiles) {
        const filePath = path.join(PROJECT_DOCS_FOLDER, file);
        const ext = path.extname(file).toLowerCase();

        try {
            let content: string;
            let type: 'pdf' | 'docx' | 'doc';

            if (ext === '.pdf') {
                content = await parsePdf(filePath);
                type = 'pdf';
            } else if (ext === '.docx' || ext === '.doc') {
                content = await parseDocx(filePath);
                type = ext === '.docx' ? 'docx' : 'doc';
            } else {
                continue;
            }

            const cleanedContent = cleanText(content);
            const wordCount = cleanedContent.split(/\s+/).length;

            // Skip documents with very little content
            if (wordCount < 50) {
                console.log(`   ⚠️ Skipping ${file}: too little content (${wordCount} words)`);
                continue;
            }

            documents.push({
                filename: file,
                title: generateTitle(file),
                content: truncateContent(cleanedContent),
                type,
                wordCount,
            });

            console.log(`   ✓ ${generateTitle(file)} (${wordCount} words)`);

        } catch (error: any) {
            console.log(`   ✗ Error parsing ${file}: ${error.message || error}`);
        }
    }

    console.log(`   Successfully parsed ${documents.length} project documents\n`);
    return documents;
}

// =============================================================================
// KNOWLEDGE BASE INTERFACES
// =============================================================================

interface KnowledgeDocument {
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

interface StoredDocument {
    id: string;
    content: string;
    embedding: number[];
    metadata: KnowledgeDocument['metadata'];
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
    const response = await fetch(`${EMBEDDING_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: { parts: [{ text }] },
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Embedding API failed: ${response.status} - ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.embedding?.values || [];
}

async function generateEmbeddings(texts: string[], apiKey: string): Promise<number[][]> {
    const results: number[][] = [];
    const batchSize = 5;

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        console.log(`   Processing ${i + 1}-${Math.min(i + batchSize, texts.length)} of ${texts.length}...`);

        const batchResults = await Promise.all(
            batch.map(text => generateEmbedding(text, apiKey))
        );
        results.push(...batchResults);

        if (i + batchSize < texts.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
}

async function buildKnowledgeBase(): Promise<KnowledgeDocument[]> {
    const documents: KnowledgeDocument[] = [];

    // Build project documents
    const projects = projectsData.projects || [];
    for (const project of projects) {
        const content = `
Project: ${project.title}
Category: ${project.category || 'General'}
Technologies: ${(project.tech || []).join(', ')}
Description: ${project.description || ''}
${project.longDescription ? `Details: ${project.longDescription}` : ''}
${project.metric ? `Key Metric: ${project.metric}` : ''}
        `.trim();

        documents.push({
            id: `project-${project.id}`,
            content,
            metadata: {
                title: project.title,
                type: 'project',
                category: project.category,
                tags: project.tech,
                source: 'projects.ts',
            },
        });
    }
    console.log(`   Found ${documents.length} projects`);

    // Build skill documents
    const skillCategories = skillsData.skillCategories || [];
    for (const category of skillCategories) {
        const skillsList = (category.skills || [])
            .map((s: any) => `- ${s.name}: ${s.proficiency}% proficiency${s.details ? ` (${s.details})` : ''}`)
            .join('\n');

        documents.push({
            id: `skills-${category.id}`,
            content: `Skill Category: ${category.title}\nDescription: ${category.description || ''}\n\nSkills:\n${skillsList}`,
            metadata: {
                title: category.title,
                type: 'skill',
                category: category.id,
                source: 'skills.ts',
            },
        });
    }
    console.log(`   Found ${skillCategories.length} skill categories`);

    // Build experience documents
    const experiences = experienceData.experiences || [];
    for (const exp of experiences) {
        const highlights = (exp.highlights || []).map((h: string) => `- ${h}`).join('\n');
        const content = `
Experience: ${exp.title} at ${exp.organization}
Period: ${exp.period}
Type: ${exp.type}
Description: ${exp.description || ''}

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
                source: 'experience.ts',
            },
        });
    }
    console.log(`   Found ${experiences.length} experience entries`);

    // Build persona documents from ai-persona
    const persona = personaData.aiPersona || {};
    if (persona.identity) {
        documents.push({
            id: 'persona-identity',
            content: `About Srujan:\nName: ${persona.identity.fullName || 'K Srujan'}\nRole: ${persona.identity.role || 'AI/ML Engineer'}\nTagline: ${persona.identity.tagline || ''}\nLocation: ${persona.identity.location || 'India'}`,
            metadata: { title: 'About Srujan', type: 'persona', source: 'ai-persona.ts' },
        });
    }
    if (persona.expertise) {
        documents.push({
            id: 'persona-expertise',
            content: `Srujan's Areas of Expertise:\n\nPrimary: ${(persona.expertise.primary || []).join(', ')}\nSecondary: ${(persona.expertise.secondary || []).join(', ')}\nInterests: ${(persona.expertise.interests || []).join(', ')}`,
            metadata: { title: 'Expertise Areas', type: 'persona', source: 'ai-persona.ts' },
        });
    }

    // Build personal profile documents (NEW - comprehensive knowledge base)
    const personalProfile = personalProfileData.personalKnowledgeBase;
    if (personalProfile && personalProfile.sections) {
        console.log(`   Adding ${personalProfile.sections.length} personal profile sections...`);

        for (const section of personalProfile.sections) {
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

        // Add RAG guidelines
        if (personalProfile.ragGuidelines) {
            const guidelines = personalProfile.ragGuidelines;
            const guidelinesContent = `
RAG Guidelines for AI Clone:

Voice & Tone:
${(guidelines.voiceAndTone || []).map((v: string) => `- ${v}`).join('\n')}

Key Phrases to Use:
${(guidelines.keyPhrases || []).map((p: string) => `- "${p}"`).join('\n')}

Decision Framework:
${(guidelines.decisionFramework || []).map((d: string) => `- ${d}`).join('\n')}

Sensitive Topics:
${(guidelines.sensitiveTopics || []).map((t: any) => `- ${t.topic}: ${t.guidance}`).join('\n')}
            `.trim();

            documents.push({
                id: 'profile-rag-guidelines',
                content: guidelinesContent,
                metadata: {
                    title: 'RAG Guidelines',
                    type: 'persona',
                    tags: ['guidelines', 'voice', 'tone'],
                    source: 'personal-profile.ts',
                },
            });
        }
    }

    // Build life knowledge documents (comprehensive life info)
    const lifeKnowledge = lifeKnowledgeData.lifeKnowledgeBase;
    if (lifeKnowledge && lifeKnowledge.sections) {
        console.log(`   Adding ${lifeKnowledge.sections.length} life knowledge sections...`);

        for (const section of lifeKnowledge.sections) {
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
    }

    // Build media knowledge documents (comprehensive media info)
    const mediaKnowledge = mediaKnowledgeData.mediaKnowledgeBase;
    if (mediaKnowledge && mediaKnowledge.sections) {
        console.log(`   Adding ${mediaKnowledge.sections.length} media knowledge sections...`);

        for (const section of mediaKnowledge.sections) {
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
    }

    // Build project estimate documents
    const projectTypes = projectEstimatesData.projectTypes || [];
    for (const type of projectTypes) {
        documents.push({
            id: `estimate-type-${type.id}`,
            content: `Service Type: ${type.name}\nDescription: ${type.description}\nBase Price: $${type.basePrice.min} - $${type.basePrice.max}\nTimeline: ${type.baseWeeks.min} - ${type.baseWeeks.max} weeks`,
            metadata: {
                title: `${type.name} Pricing`,
                type: 'skill', // Using skill type to group with professional knowledge
                category: 'pricing',
                source: 'project-estimates.ts',
            },
        });
    }

    const features = projectEstimatesData.features || [];
    // Group features by category for better context
    const featuresByCategory: Record<string, any[]> = {};
    for (const feature of features) {
        const category = feature.applicableProjectTypes[0] || 'general'; // Use primary category
        if (!featuresByCategory[category]) featuresByCategory[category] = [];
        featuresByCategory[category].push(feature);
    }

    for (const [category, categoryFeatures] of Object.entries(featuresByCategory)) {
        const featureList = categoryFeatures.map(f =>
            `- ${f.name}: +$${f.priceAdd.min}-${f.priceAdd.max} (+${f.weeksAdd} weeks). ${f.description}`
        ).join('\n');

        documents.push({
            id: `estimate-features-${category}`,
            content: `Add-on Features for ${category} Projects:\n\n${featureList}`,
            metadata: {
                title: `${category} Features Pricing`,
                type: 'skill',
                category: 'pricing',
                source: 'project-estimates.ts',
            },
        });
    }

    const complexityLevels = projectEstimatesData.complexityLevels || [];
    const complexityText = complexityLevels.map((c: any) =>
        `- ${c.name}: ${c.multiplier}x multiplier. ${c.description}`
    ).join('\n');

    documents.push({
        id: 'estimate-complexity',
        content: `Project Complexity Levels & Pricing Multipliers:\n\n${complexityText}`,
        metadata: {
            title: 'Project Complexity Pricing',
            type: 'skill',
            category: 'pricing',
            source: 'project-estimates.ts',
        },
    });

    // Build testimonial documents
    const testimonials = testimonialsData.testimonials || [];
    for (const t of testimonials) {
        documents.push({
            id: `testimonial-${t.id}`,
            content: `Testimonial from ${t.name} (${t.role} at ${t.company}):\n"${t.content}"`,
            metadata: {
                title: `Testimonial: ${t.company}`,
                type: 'experience',
                category: 'reviews',
                source: 'testimonials.ts',
            },
        });
    }

    // =============================================================================
    // BUILD PROJECT DOCUMENTATION FROM PDFs AND WORD FILES
    // =============================================================================
    console.log('\n📄 Parsing project documentation files (PDFs & Word docs)...');
    const projectDocs = await parseProjectDocuments();

    for (const doc of projectDocs) {
        documents.push({
            id: `project-doc-${doc.filename.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
            content: `Project Documentation: ${doc.title}\n\n${doc.content}`,
            metadata: {
                title: doc.title,
                type: 'project',
                category: 'documentation',
                tags: ['project', 'documentation', doc.type],
                source: `Projects_doc_pdf and word/${doc.filename}`,
            },
        });
    }

    console.log(`   Added ${projectDocs.length} project documentation files to knowledge base`);

    // =============================================================================
    // GITHUB MAJOR PROJECTS (README content from key repositories)
    // =============================================================================
    console.log('\n🚀 Adding GitHub major project descriptions...');

    const githubProjects = [
        {
            id: 'eip-platform',
            title: 'Entrepreneurship Intelligence Platform (EIP)',
            summary: `AI-Powered Decision-Making System for Entrepreneurs. A unified platform combining real-time intelligence, 35+ specialized AI agents, and multi-agent backend systems.

Key Features:
- 35 Specialized AI Agents covering every aspect of business (policy, market, finance, tax, legal, etc.)
- Agent-to-Agent (A2A) Communication for comprehensive analysis
- Real-time Intelligence Dashboard with live market data
- GraphRAG Knowledge System using Neo4j
- Memory-Enabled Intelligence (short-term + long-term)
- Document Intelligence with OCR + LLMs

Tech Stack: FastAPI, LangChain, DSPy, GPT-4o, Claude, PostgreSQL, MongoDB, Neo4j, Redis, Kafka, Spark, Kubernetes, Docker.

Unique Features:
- Connecting-Dots Intelligence for cross-domain pattern recognition
- Philosophy & Happiness integration for holistic business decisions
- India-First with global perspective
- Production-ready with 99.9% uptime SLA`,
            tags: ['ai-agents', 'entrepreneurship', 'langchain', 'graphrag', 'multi-agent', 'business-intelligence'],
        },
        {
            id: 'clinical-ai-copilot',
            title: 'Clinical AI Copilot with Multimodal EEG + Clinical RAG',
            summary: `Enterprise-grade healthcare AI system for neurological disorder detection, combining real-time EEG analysis with clinical knowledge retrieval.

Key Features:
- Real-time EEG Analysis: 16-32 channel processing at 256-1024 Hz
- CNN-LSTM Hybrid for seizure detection (98.75% target accuracy)
- Transformer for sleep stage classification
- Spiking Neural Network for energy-efficient event detection
- Llama 3.1 8B with QLoRA for clinical text understanding
- GraphRAG with Neo4j for medical ontologies (SNOMED-CT, ICD-10, RxNorm)
- HIPAA-compliant with end-to-end encryption

Clinical Impact:
- Detection time reduced from 2-4 hours to 2 minutes
- Diagnostic accuracy improved to 98.75%
- False positives reduced by 83%
- Cost per patient reduced by 90%

Tech Stack: PyTorch, FastAPI, Neo4j, Qdrant, Kafka, Prometheus, Grafana, Docker, Kubernetes.`,
            tags: ['healthcare-ai', 'eeg-analysis', 'medical-ai', 'deep-learning', 'hipaa', 'clinical-rag'],
        },
        {
            id: 'space-debris-tracker',
            title: 'Space Debris Tracking & Autonomous Collision Prediction System',
            summary: `Comprehensive framework for space debris tracking and collision prediction using AI-powered computer vision, physics-informed machine learning, and autonomous monitoring agents.

Key Features:
- YOLOv7 Detection for custom debris detection
- DINO v2 for zero-shot novel object detection
- DeepSORT for multi-object tracking with Kalman filtering
- Physics-Informed Neural Networks (PINN) for orbital mechanics
- Transformer Architecture for multi-object interaction modeling
- Neo4j-based Knowledge Graph for satellite catalog and conjunctions
- Multi-Agent Monitoring System using MCP protocol

Target Performance:
- Track 10,000+ concurrent satellites
- <100ms real-time streaming latency
- 5,000 API requests/second

Market: Global SSA Market ~$2.5B/year, growing 15% annually.

Tech Stack: PyTorch, FastAPI, Neo4j, Qdrant, Kafka, Spark, Docker, Kubernetes.`,
            tags: ['space', 'computer-vision', 'physics-ml', 'tracking', 'autonomous-agents', 'satellite'],
        },
        {
            id: 'finance-trading-copilot',
            title: 'Finance Analytics & Trading Co-Pilot',
            summary: `Real-Time Finance Analytics Platform with AI-Powered Trading Assistant. Combines streaming data processing, machine learning, and AI for market insights and trading recommendations.

Key Features:
- Real-time data ingestion from market data, news, social media
- AI Co-Pilot using LangChain with RAG and GraphRAG
- RL Trading Agent using Deep Q-Network (DQN)
- VLM Chart Analysis for visual interpretation of stock charts
- Offline Analytics with local LLMs (LLaMA/Mistral) for privacy
- Smart Model Orchestration with automatic fallback

Architecture:
- Streaming: Apache Kafka + Spark Structured Streaming
- Databases: PostgreSQL, MongoDB, Qdrant, Neo4j
- AI/ML: LangChain, OpenAI GPT-4, Stable-Baselines3
- Vision Models: GPT-4 Vision, LLaVA, BLIP-2

Features:
- Multi-Modal Data Fusion (prices, news sentiment, social media)
- Computational Psychiatry for trader behavior monitoring
- Real-time Grafana dashboards

Tech Stack: FastAPI, Kafka, Spark, Neo4j, MLflow, Prometheus, Docker.`,
            tags: ['finance', 'trading', 'rl-agent', 'langchain', 'streaming', 'market-analysis'],
        },
        {
            id: 'robot-assistant-vla',
            title: 'Vision-Language Robotic Assistant (VLA-Sim)',
            summary: `Sophisticated embodied AI system combining vision-language models, robotic control, and autonomous planning for home service robotics.

Capabilities:
- 👁️ See: Vision Transformers (ViT-DINO), depth estimation (MiDaS), OCR
- 🧠 Understand: Natural language commands via LLMs
- 💾 Remember: GraphRAG knowledge graphs and vector memory
- 🤖 Act: ROS2 navigation, manipulation, learned RL policies
- 📈 Learn: Reinforcement learning and continuous adaptation

Key Features:
- Vision-Language-Action (VLA): Direct image-to-action policies
- LangChain Agent with ReAct reasoning
- MCP Protocol for AI-to-robot interface
- Deep RL for navigation and grasping (Q-learning, PPO)
- Spiking Neural Networks for ultra-fast reflexes (<100ms)

Infrastructure:
- 100+ Microservices with Docker & Kubernetes
- Monitoring: Prometheus/Grafana
- MLOps: MLflow
- Hardware & Simulation: TurtleBot3, Gazebo

Tech Stack: ROS2, PyTorch, FastAPI, Neo4j, Docker, Kubernetes.`,
            tags: ['robotics', 'vla', 'ros2', 'embodied-ai', 'navigation', 'manipulation'],
        },
        {
            id: 'wellness-ai-platform',
            title: 'Wellness AI Platform - Holistic Health Intelligence',
            summary: `Advanced AI-powered holistic wellness platform combining EEG brain signal analysis, conversational AI coaching, astrological insights, and personalized health recommendations—merging ancient wisdom (Ayurveda, Astrology) with modern science.

Key Features:
- 🧠 Neural Signal Analysis: Real-time EEG brainwave monitoring
- 🤖 AI Wellness Coach: LLM-powered empathetic guidance with memory
- 🌿 Ayurvedic Integration: Dosha assessment and recommendations
- ⭐ Astrological Wellness: Natal chart analysis for health insights
- 🔬 Multi-Modal Health Tracking: Voice, food recognition, supplement OCR
- 📊 Life Optimization: Schedule optimization, meal planning, progress tracking
- 🧘 Spiritual Wellness: Meditation guidance, breathing exercises

Unique Differentiators:
- Holistic Ancient-Modern Integration (Ayurveda + AI)
- GraphRAG connecting traditional wisdom with modern science
- Spiking Neural Networks for EEG processing
- Complete Life Optimization Suite

Privacy-First: End-to-end encryption, GDPR/HIPAA ready.

Tech Stack: FastAPI, PyTorch, LangChain, Neo4j, ChromaDB, PostgreSQL, MongoDB, Streamlit.`,
            tags: ['wellness', 'health-ai', 'eeg', 'ayurveda', 'mental-health', 'holistic'],
        },
    ];

    for (const project of githubProjects) {
        documents.push({
            id: `github-${project.id}`,
            content: `GitHub Project: ${project.title}\n\n${project.summary}`,
            metadata: {
                title: project.title,
                type: 'project',
                category: 'github-major-project',
                tags: project.tags,
                source: `GitHub Repository: ${project.id}`,
            },
        });
    }

    console.log(`   Added ${githubProjects.length} GitHub major projects to knowledge base`);

    return documents;
}

async function main() {
    console.log('🚀 Embedding Generation Script');
    console.log('================================\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ Error: GEMINI_API_KEY not found in environment');
        console.log('\nPlease ensure .env.local contains:');
        console.log('GEMINI_API_KEY=your_api_key_here');
        process.exit(1);
    }

    console.log('✅ API key found\n');

    // Build knowledge base
    console.log('📚 Building knowledge base...');
    const documents = await buildKnowledgeBase();
    console.log(`\n   Created ${documents.length} total documents\n`);

    if (documents.length === 0) {
        console.log('⚠️ No documents found, exiting');
        process.exit(0);
    }

    // Generate embeddings
    console.log('🔄 Generating embeddings (this may take a minute)...');
    const startTime = Date.now();

    try {
        const embeddings = await generateEmbeddings(
            documents.map(doc => doc.content),
            apiKey
        );

        console.log(`   Generated ${embeddings.length} embeddings in ${Date.now() - startTime}ms\n`);

        // Create stored documents
        const storedDocs: StoredDocument[] = documents.map((doc, i) => ({
            id: doc.id,
            content: doc.content,
            embedding: embeddings[i],
            metadata: doc.metadata,
        }));

        // Save to cache
        const cacheFile = path.join(process.cwd(), 'data', 'embeddings-cache.json');
        fs.writeFileSync(cacheFile, JSON.stringify(storedDocs, null, 2));

        console.log('================================');
        console.log('✅ Embeddings generated and cached successfully!');
        console.log(`   Total documents: ${documents.length}`);
        console.log(`   Cache location: data/embeddings-cache.json`);
        console.log('\nThe RAG system will now load instantly on startup.');

    } catch (error) {
        console.error('\n❌ Error generating embeddings:', error);
        process.exit(1);
    }
}

main();
