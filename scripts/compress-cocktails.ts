import fs from 'fs';
import path from 'path';
import pako from 'pako';

// Read the cocktails data from private directory
const cocktailsPath = path.join(process.cwd(), 'private', 'data', 'cocktails.json');
const cocktailsData = JSON.parse(fs.readFileSync(cocktailsPath, 'utf-8'));

// Compress the data
const compressedData = pako.deflate(JSON.stringify(cocktailsData));

// Convert to base64 for safe storage
const base64Data = Buffer.from(compressedData).toString('base64');

// Create the output file content
const outputContent = `// This file is auto-generated. Do not edit manually.
export const compressedCocktails = "${base64Data}";
`;

// Write the output file to public data directory
const outputPath = path.join(process.cwd(), 'data', 'cocktails.compressed.ts');
fs.writeFileSync(outputPath, outputContent);

// Log compression stats
const originalSize = JSON.stringify(cocktailsData).length;
const compressedSize = base64Data.length;
const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

console.log('✅ Cocktails data compressed successfully');
console.log(`📊 Compression stats:
  Original size: ${(originalSize / 1024).toFixed(2)} KB
  Compressed size: ${(compressedSize / 1024).toFixed(2)} KB
  Compression ratio: ${compressionRatio}%`); 