import { createClient } from '@supabase/supabase-js';

// Cloudflare Worker types
interface R2Bucket {
  put: (key: string, value: ReadableStream | ArrayBuffer | string) => Promise<void>;
  get: (key: string) => Promise<R2Object | null>;
  delete: (key: string) => Promise<void>;
  list: (options?: R2ListOptions) => Promise<R2ListResult>;
}

interface R2Object {
  key: string;
  size: number;
  etag: string;
  uploaded: Date;
  httpEtag: string;
  checksums: R2Checksums;
  writeHttpMetadata: (headers: Headers) => void;
  body: ReadableStream;
}

interface R2Checksums {
  md5?: string;
}

interface R2ListOptions {
  prefix?: string;
  delimiter?: string;
  cursor?: string;
  limit?: number;
}

interface R2ListResult {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}

interface ExecutionContext {
  waitUntil: (promise: Promise<any>) => void;
}

interface Env {
  BUCKET: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ALLOWED_ORIGINS: string;
}

function handleCORS(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
  
  // Check if the origin is allowed
  if (!origin || !allowedOrigins.includes(origin)) {
    return new Response('Not allowed', { status: 403 });
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // For actual requests, add CORS headers
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS(request, env);
    }

    // Verify Supabase JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return new Response('Invalid token', { status: 401 });
      }
    } catch (error) {
      return new Response('Invalid token', { status: 401 });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      let response: Response;
      if (path.startsWith('/api/upload/') && path !== '/api/upload/presign' && path !== '/api/upload/complete') {
        response = await handleDirectUpload(request, env);
      } else {
        switch (path) {
          case '/api/upload/presign':
            response = await handlePresignRequest(request, env);
            break;
          case '/api/upload/complete':
            response = await handleUploadComplete(request, env);
            break;
          default:
            response = new Response('Not found', { status: 404 });
        }
      }

      // Add CORS headers to the response
      const corsHeaders = handleCORS(request, env).headers;
      for (const [key, value] of corsHeaders.entries()) {
        response.headers.set(key, value);
      }

      return response;
    } catch (error: unknown) {
      // Enhanced error logging
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        cause: error instanceof Error ? error.cause : undefined
      });
      
      const response = new Response(JSON.stringify({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Add CORS headers to error response
      const corsHeaders = handleCORS(request, env).headers;
      for (const [key, value] of corsHeaders.entries()) {
        response.headers.set(key, value);
      }

      return response;
    }
  },
};

async function handlePresignRequest(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { fileName, contentType, userId, entityId } = await request.json();
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(contentType)) {
    return new Response('Invalid file type', { status: 400 });
  }
  
  // Generate a unique file path
  const filePath = `${userId}/${entityId}/${Date.now()}-${fileName}`;
  
  try {
    // Instead of creating a presigned URL, we'll return the file path
    // The client will need to upload directly to the worker endpoint
    return new Response(JSON.stringify({
      filePath,
      uploadUrl: `${new URL(request.url).origin}/api/upload/${filePath}`,
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    console.error('Error handling upload request:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process upload request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

async function handleUploadComplete(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { filePath, userId, entityId, metadata } = await request.json();

  // Initialize Supabase client with service role key
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Save metadata to Supabase
  const { error } = await supabase
    .from('media_items')
    .insert({
      url: filePath,
      user_id: userId,
      entity_id: entityId,
      entity_type: 'cocktail_log',
      bucket: 'cocktail-logs',
      content_type: metadata.contentType,
      file_size: metadata.fileSize,
      original_name: metadata.originalName,
      metadata,
      status: 'active',
      cocktail_log_id: entityId
    });

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Add a new handler for direct uploads
async function handleDirectUpload(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'PUT') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const filePath = url.pathname.replace('/api/upload/', '');
  
  try {
    // Clone the request to ensure we can read the body
    const clonedRequest = request.clone();
    const body = await clonedRequest.arrayBuffer();
    
    // Store the file in R2
    await env.BUCKET.put(filePath, body);
    
    return new Response(JSON.stringify({
      success: true,
      filePath,
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    console.error('Error uploading file:', error);
    return new Response(JSON.stringify({
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 