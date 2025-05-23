import fs from 'fs';
import path from 'path';
import pako from 'pako';

// Read the cocktails data
const cocktailsPath = path.join(
  process.cwd(),
  'data',
  'cocktails.json',
);
const cocktailsData = JSON.parse(
  fs.readFileSync(cocktailsPath, 'utf-8'),
);

// Compress the data
const compressedData = pako.deflate(
  JSON.stringify(cocktailsData),
);

// Convert to base64 for safe storage
const base64Data =
  Buffer.from(compressedData).toString('base64');

// Create the output file content
const outputContent = `// This file is auto-generated. Do not edit manually.
export const compressedCocktails = "${base64Data}";

export function decompress(data: string): any {
  const compressed = Buffer.from(data, 'base64');
  const decompressed = pako.inflate(compressed);
  return JSON.parse(new TextDecoder().decode(decompressed));
}
`;

// Write the output file
const outputPath = path.join(
  process.cwd(),
  'lib',
  'build-compression.ts',
);
fs.writeFileSync(outputPath, outputContent);

console.log('✅ Cocktails data compressed successfully');
