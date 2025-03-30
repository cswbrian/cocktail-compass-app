import pako from 'pako';

export function decompress(data: string): unknown {
  const compressed = Buffer.from(data, 'base64');
  const decompressed = pako.inflate(compressed);
  return JSON.parse(new TextDecoder().decode(decompressed));
} 