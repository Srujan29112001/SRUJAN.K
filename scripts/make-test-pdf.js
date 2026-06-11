// Generates a minimal valid one-page PDF with enough text (>50 words)
// to pass parseDocument's word-count floor. Used only for local testing.
const fs = require('fs');

const words = [];
for (let i = 1; i <= 70; i++) words.push(`word${i}`);
const text = `Canvas stub verification document. ${words.join(' ')} end of test.`;

const lines = [];
const chunkSize = 12;
const parts = text.split(' ');
for (let i = 0; i < parts.length; i += chunkSize) {
    lines.push(parts.slice(i, i + chunkSize).join(' '));
}
const contentOps = ['BT', '/F1 10 Tf', '40 760 Td', '12 TL'];
lines.forEach((l, i) => {
    const esc = l.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    contentOps.push(i === 0 ? `(${esc}) Tj` : `T* (${esc}) Tj`);
});
contentOps.push('ET');
const stream = contentOps.join('\n');

const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
];

let pdf = '%PDF-1.4\n';
const offsets = [0];
objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});
const xrefPos = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

fs.writeFileSync(process.argv[2] || 'test-canvas-stub.pdf', pdf, 'binary');
console.log('wrote', process.argv[2] || 'test-canvas-stub.pdf', pdf.length, 'bytes');
