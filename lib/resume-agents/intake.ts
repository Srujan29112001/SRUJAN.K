/**
 * INTAKE AGENT — normalizes the visitor's three inputs (role, company,
 * requirements/JD text) into a structured JobIntake.
 *
 * LLM path: extracts skills, responsibilities, seniority, work mode, and
 * red flags (bonds, deposits, unusual terms) from the raw JD text.
 * Deterministic fallback: vocabulary scan against the portfolio's own tech
 * terms + a common-skills lexicon, so the pipeline works with zero API keys.
 */

import { generateJSON } from '@/lib/ai-providers';
import { projects } from '@/data/projects';
import { skillCategories } from '@/data/skills';
import type { JobIntake, LLMBase } from './types';

export interface IntakeInput {
    role: string;
    company: string;
    requirements: string;
}

const COMMON_SKILLS = [
    'Python', 'C++', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'NoSQL', 'Bash', 'R', 'Go', 'Rust',
    'PyTorch', 'TensorFlow', 'Keras', 'scikit-learn', 'OpenCV', 'YOLO', 'CNN', 'Transformer',
    'LLM', 'RAG', 'LangChain', 'NLP', 'Computer Vision', 'Deep Learning', 'Machine Learning',
    'Reinforcement Learning', 'GAN', 'Diffusion', 'Fine-tuning', 'Prompt Engineering',
    'ROS', 'ROS2', 'Gazebo', 'Jetson', 'TensorRT', 'CUDA', 'Edge AI', 'Embedded', 'Raspberry Pi',
    'Arduino', 'Sensor Fusion', 'SLAM', 'Control Systems', 'PID', 'Kinematics',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'MLOps', 'CI/CD', 'Git', 'Linux',
    'FastAPI', 'Flask', 'Django', 'React', 'Next.js', 'Node.js', 'MongoDB', 'PostgreSQL',
    'Kafka', 'Spark', 'Hadoop', 'PySpark', 'Pandas', 'NumPy', 'MATLAB', 'Simulink',
    'Qiskit', 'Quantum', 'EEG', 'Signal Processing', 'Data Science', 'Data Analysis',
    'Agents', 'Multi-Agent', 'OpenAI', 'Anthropic', 'Gemini', 'Hugging Face', 'GraphRAG',
    'Vector Database', 'Embeddings', 'Streamlit', 'Airflow', 'MLflow', 'REST API', 'GraphQL',
];

const RED_FLAG_PATTERNS: Array<{ re: RegExp; flag: string }> = [
    { re: /\b(\d+)[\s-]*(year|yr)s?\s*(bond|service agreement|commitment)/i, flag: 'Multi-year service bond mentioned' },
    { re: /security deposit|salary deposit|training fee/i, flag: 'Deposit / training fee mentioned' },
    { re: /night shift|rotational shift|graveyard/i, flag: 'Night / rotational shifts' },
    { re: /unpaid/i, flag: 'Unpaid work mentioned' },
];

function deterministicIntake(input: IntakeInput): JobIntake {
    const text = input.requirements;
    const lower = text.toLowerCase();

    // Vocabulary scan: common skills + every tech tag in the portfolio
    const vocab = new Set<string>(COMMON_SKILLS);
    for (const p of projects) p.tech.forEach(t => vocab.add(t));
    for (const c of skillCategories) c.skills.forEach(s => vocab.add(s.name.split('(')[0].trim()));

    const found = new Map<string, string>(); // lowercase → display
    vocab.forEach(skill => {
        const needle = skill.toLowerCase();
        if (needle.length < 2) return;
        if (lower.includes(needle)) found.set(needle, skill);
    });
    // Drop entries fully contained in a longer match (e.g. "ros" inside "ros2")
    const keys = Array.from(found.keys());
    const requiredSkills = keys
        .filter(k => !keys.some(other => other !== k && other.includes(k)))
        .map(k => found.get(k)!)
        .slice(0, 25);

    const redFlags = RED_FLAG_PATTERNS.filter(p => p.re.test(text)).map(p => p.flag);

    const workMode = /remote/i.test(text) ? 'remote'
        : /hybrid/i.test(text) ? 'hybrid'
        : /on[\s-]?site/i.test(text) ? 'on-site' : undefined;

    const seniorMatch = text.match(/(\d+)\s*\+?\s*(?:years|yrs)/i);
    const seniority = seniorMatch
        ? (parseInt(seniorMatch[1]) >= 7 ? 'senior' : parseInt(seniorMatch[1]) >= 3 ? 'mid' : 'entry/junior')
        : 'unspecified';

    const roleLower = input.role.toLowerCase();
    const domain =
        /(robot|autonomous|drone|agv|amr)/.test(roleLower + ' ' + lower) ? 'Robotics & Autonomous Systems'
        : /(vision|image|camera|detection|edge)/.test(roleLower + ' ' + lower) ? 'Computer Vision / Edge AI'
        : /(llm|agent|prompt|genai|generative|rag|nlp)/.test(roleLower + ' ' + lower) ? 'LLMs / GenAI / Agents'
        : /(reinforcement|\brl\b)/.test(roleLower + ' ' + lower) ? 'Reinforcement Learning'
        : /(data (scien|analy)|machine learning|\bml\b|\bai\b)/.test(roleLower + ' ' + lower) ? 'AI / Machine Learning'
        : /(full.?stack|frontend|backend|web)/.test(roleLower) ? 'Software Engineering'
        : 'General Engineering';

    return {
        role: input.role.trim(),
        company: input.company.trim(),
        seniority,
        domain,
        requiredSkills,
        responsibilities: [],
        keywords: requiredSkills.slice(0, 10),
        workMode,
        location: undefined,
        redFlags,
    };
}

export async function parseIntake(input: IntakeInput, llmBase?: LLMBase | null): Promise<{ intake: JobIntake; usedLLM: boolean; llm?: string }> {
    const fallback = deterministicIntake(input);
    if (!llmBase) return { intake: fallback, usedLLM: false };

    try {
        const { data, provider, model } = await generateJSON<Partial<JobIntake>>({
            ...llmBase,
            system: 'You parse job descriptions into structured JSON. Extract only what the text actually says — never invent.',
            prompt: `Parse this job opportunity.

ROLE (from form): ${input.role}
COMPANY (from form): ${input.company}
JOB DESCRIPTION / REQUIREMENTS:
"""
${input.requirements.slice(0, 6000)}
"""

Return JSON with exactly these keys:
{
  "role": "cleaned role title",
  "company": "cleaned company name",
  "seniority": "entry/junior | mid | senior | unspecified",
  "domain": "one short phrase for the technical domain",
  "requiredSkills": ["up to 25 concrete skills/technologies the JD asks for"],
  "responsibilities": ["up to 6 short responsibility phrases"],
  "keywords": ["up to 10 other important keywords"],
  "workMode": "remote | hybrid | on-site | null",
  "location": "city or null",
  "redFlags": ["anything a candidate should know: bonds, deposits, unusual shifts, unpaid work — empty array if none"]
}`,
            temperature: 0.2,
            maxTokens: 2500,
        });

        return {
            intake: {
                role: (data.role || fallback.role).slice(0, 120),
                company: (data.company || fallback.company).slice(0, 120),
                seniority: data.seniority || fallback.seniority,
                domain: data.domain || fallback.domain,
                requiredSkills: (Array.isArray(data.requiredSkills) && data.requiredSkills.length
                    ? data.requiredSkills : fallback.requiredSkills).slice(0, 25).map(String),
                responsibilities: (Array.isArray(data.responsibilities) ? data.responsibilities : []).slice(0, 6).map(String),
                keywords: (Array.isArray(data.keywords) && data.keywords.length
                    ? data.keywords : fallback.keywords).slice(0, 10).map(String),
                workMode: data.workMode || fallback.workMode,
                location: data.location || undefined,
                redFlags: Array.from(new Set([
                    ...(Array.isArray(data.redFlags) ? data.redFlags.map(String) : []),
                    ...fallback.redFlags, // regex flags are reliable — always keep them
                ])).slice(0, 5),
            },
            usedLLM: true,
            llm: `${provider}:${model}`,
        };
    } catch (e) {
        console.warn('Intake LLM failed, using deterministic parse:', e instanceof Error ? e.message : e);
        return { intake: fallback, usedLLM: false };
    }
}
