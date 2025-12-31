/**
 * Document Parser Utility
 * Extracts text content from PDF and Word documents for RAG indexing
 */

import fs from 'fs';
import path from 'path';

// Dynamic imports for document parsing libraries
let pdfjsLib: typeof import('pdfjs-dist') | null = null;
let mammoth: typeof import('mammoth') | null = null;

async function loadPdfParser() {
    if (!pdfjsLib) {
        pdfjsLib = await import('pdfjs-dist');
    }
    return pdfjsLib;
}

async function loadMammoth() {
    if (!mammoth) {
        mammoth = await import('mammoth');
    }
    return mammoth;
}

export interface ParsedDocument {
    filename: string;
    title: string;
    content: string;
    type: 'pdf' | 'docx' | 'doc';
    pageCount?: number;
    wordCount: number;
}

/**
 * Extract text from a PDF file using pdfjs-dist
 */
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

/**
 * Extract text from a Word document (.docx)
 */
async function parseDocx(filePath: string): Promise<string> {
    const parser = await loadMammoth();
    const dataBuffer = fs.readFileSync(filePath);
    const result = await parser.extractRawText({ buffer: dataBuffer });
    return result.value;
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text: string): string {
    return text
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Remove page numbers and headers/footers patterns
        .replace(/Page \d+ of \d+/gi, '')
        .replace(/^\d+\s*$/gm, '')
        // Clean up common PDF artifacts
        .replace(/\x00/g, '')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        // Normalize line breaks
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Generate a readable title from filename
 */
function generateTitle(filename: string): string {
    // Remove extension
    let title = filename.replace(/\.(pdf|docx|doc)$/i, '');

    // Replace underscores and hyphens with spaces
    title = title.replace(/[_-]/g, ' ');

    // Clean up multiple spaces
    title = title.replace(/\s+/g, ' ').trim();

    // Capitalize first letter of each word
    title = title.split(' ').map(word => {
        if (word.length <= 2) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');

    return title;
}

/**
 * Parse a single document file
 */
export async function parseDocument(filePath: string): Promise<ParsedDocument | null> {
    const filename = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();

    try {
        let content: string;
        let type: 'pdf' | 'docx' | 'doc';

        if (ext === '.pdf') {
            content = await parsePdf(filePath);
            type = 'pdf';
        } else if (ext === '.docx') {
            content = await parseDocx(filePath);
            type = 'docx';
        } else if (ext === '.doc') {
            // .doc files are harder to parse, try mammoth anyway
            content = await parseDocx(filePath);
            type = 'doc';
        } else {
            console.warn(`Unsupported file type: ${ext}`);
            return null;
        }

        const cleanedContent = cleanText(content);
        const wordCount = cleanedContent.split(/\s+/).length;

        // Skip documents with very little content
        if (wordCount < 50) {
            console.warn(`Skipping ${filename}: too little content (${wordCount} words)`);
            return null;
        }

        return {
            filename,
            title: generateTitle(filename),
            content: cleanedContent,
            type,
            wordCount,
        };
    } catch (error) {
        console.error(`Error parsing ${filename}:`, error);
        return null;
    }
}

/**
 * Parse all documents in a directory
 */
export async function parseDocumentsInDirectory(dirPath: string): Promise<ParsedDocument[]> {
    const documents: ParsedDocument[] = [];

    if (!fs.existsSync(dirPath)) {
        console.error(`Directory not found: ${dirPath}`);
        return documents;
    }

    const files = fs.readdirSync(dirPath);
    const supportedExtensions = ['.pdf', '.docx', '.doc'];

    const documentFiles = files.filter(file =>
        supportedExtensions.includes(path.extname(file).toLowerCase())
    );

    console.log(`Found ${documentFiles.length} document files to parse...`);

    for (const file of documentFiles) {
        const filePath = path.join(dirPath, file);
        console.log(`Parsing: ${file}`);

        const doc = await parseDocument(filePath);
        if (doc) {
            documents.push(doc);
            console.log(`  ✓ ${doc.title} (${doc.wordCount} words)`);
        }
    }

    console.log(`\nSuccessfully parsed ${documents.length} documents`);
    return documents;
}

/**
 * Truncate content to a maximum length while keeping meaningful text
 */
export function truncateContent(content: string, maxLength: number = 3000): string {
    if (content.length <= maxLength) return content;

    // Try to cut at a sentence boundary
    const truncated = content.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');

    const cutPoint = Math.max(lastPeriod, lastNewline);

    if (cutPoint > maxLength * 0.7) {
        return truncated.substring(0, cutPoint + 1) + '...';
    }

    return truncated + '...';
}
