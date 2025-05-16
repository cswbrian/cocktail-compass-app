import pako from 'pako';

export function decompress<T>(data: string): T {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('decompress can only be used in browser environment');
    }

    // Validate input
    if (!data) {
      throw new Error('Input data is empty');
    }

    // Convert base64 to Uint8Array
    const binaryString = atob(data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decompressed = pako.inflate(bytes);
    const decoded = new TextDecoder().decode(decompressed);
    
    try {
      return JSON.parse(decoded) as T;
    } catch (e) {
      throw new Error('Failed to parse decompressed data as JSON');
    }
  } catch (error) {
    console.error('Decompression error:', error);
    throw error;
  }
} 