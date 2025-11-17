#!/usr/bin/env node

/**
 * Generate PWA icons from SVG
 * This script creates PNG icons in various sizes from the base SVG icon
 */

const fs = require('fs');
const path = require('path');

// SVG content
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#10B981"/>
  <path d="M150 150H362V210H290V362H222V210H150V150Z" fill="white"/>
  <circle cx="380" cy="380" r="30" fill="white" opacity="0.9"/>
  <circle cx="430" cy="380" r="20" fill="white" opacity="0.9"/>
  <rect x="380" y="375" width="50" height="10" fill="white" opacity="0.9"/>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Save SVG
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);

console.log('✅ SVG icon created at public/icons/icon.svg');
console.log('\n📝 To generate PNG icons, you have two options:');
console.log('\n1. Use an online converter:');
console.log('   - Visit: https://cloudconvert.com/svg-to-png');
console.log('   - Upload: public/icons/icon.svg');
console.log('   - Convert to each size: ' + sizes.join(', '));
console.log('   - Save as: icon-{size}x{size}.png');
console.log('\n2. Open generate-icons.html in your browser:');
console.log('   - Open: frontend/generate-icons.html');
console.log('   - Click "Generate Icons"');
console.log('   - Move downloaded files to public/icons/');
console.log('\n3. Use ImageMagick (if installed):');
sizes.forEach(size => {
  console.log(`   convert public/icons/icon.svg -resize ${size}x${size} public/icons/icon-${size}x${size}.png`);
});
