import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#2563eb"/>
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.12)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.04)"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="1050" cy="100" r="200" fill="rgba(255,255,255,0.05)"/>
  <circle cx="150" cy="530" r="180" fill="rgba(255,255,255,0.05)"/>
  <circle cx="1100" cy="500" r="120" fill="rgba(255,255,255,0.04)"/>

  <!-- Card -->
  <rect x="80" y="60" width="1040" height="510" rx="24" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>

  <!-- BeamX logo text top-left -->
  <text x="120" y="140" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.9)" letter-spacing="2">BEAMX SOLUTIONS</text>

  <!-- Divider line -->
  <line x1="120" y1="158" x2="480" y2="158" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>

  <!-- Main headline -->
  <text x="120" y="260" font-family="Arial, sans-serif" font-size="62" font-weight="800" fill="white">Is Your Business Idea</text>
  <text x="120" y="340" font-family="Arial, sans-serif" font-size="62" font-weight="800" fill="white">Ready to Launch?</text>

  <!-- Subheading -->
  <text x="120" y="410" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.8)">Free AI-powered validation · 5-minute assessment</text>

  <!-- CTA pill -->
  <rect x="120" y="450" width="300" height="56" rx="28" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
  <text x="270" y="484" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="white" text-anchor="middle">Get Your Score Free →</text>

  <!-- Right side score badge -->
  <circle cx="940" cy="315" r="150" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
  <circle cx="940" cy="315" r="120" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <text x="940" y="290" font-family="Arial, sans-serif" font-size="80" font-weight="800" fill="white" text-anchor="middle">87%</text>
  <text x="940" y="330" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.8)" text-anchor="middle">Readiness</text>
  <text x="940" y="360" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.8)" text-anchor="middle">Score</text>

  <!-- Bottom domain -->
  <text x="600" y="600" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.5)" text-anchor="middle">beamxsolutions.com</text>
</svg>
`;

const outputPath = resolve(root, 'public', 'og-image.png');

sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath)
  .then(() => console.log('✓ OG image generated at public/og-image.png'))
  .catch((err) => { console.error('Failed:', err); process.exit(1); });
