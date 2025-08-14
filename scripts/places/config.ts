import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();

// Environment type definition
export type Environment = 'staging' | 'production' | 'development';

// Configuration interface
export interface Config {
  environment: Environment;
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  google: {
    apiKey: string;
    placesApiKey?: string;
  };
  venues: {
    batchSize: number;
    delayMs: number;
    maxRetries: number;
    rateLimitPerSecond: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableFile: boolean;
    logFile?: string;
  };
}

// Default configuration values
const defaultConfig: Config = {
  environment: 'staging',
  supabase: {
    url: '',
    anonKey: '',
    serviceRoleKey: undefined,
  },
  google: {
    apiKey: '',
    placesApiKey: undefined,
  },
  venues: {
    batchSize: 10,
    delayMs: 1000,
    maxRetries: 3,
    rateLimitPerSecond: 100,
  },
  logging: {
    level: 'info',
    enableConsole: true,
    enableFile: false,
    logFile: undefined,
  },
};

// Environment-specific overrides
const environmentOverrides: Record<Environment, Partial<Config>> = {
  development: {
    logging: {
      level: 'debug',
      enableConsole: true,
      enableFile: false,
    },
    venues: {
      batchSize: 5,
      delayMs: 2000,
      maxRetries: 3,
      rateLimitPerSecond: 50,
    },
  },
  staging: {
    logging: {
      level: 'info',
      enableConsole: true,
      enableFile: true,
      logFile: 'staging-places-ingestion.log',
    },
    venues: {
      batchSize: 10,
      delayMs: 1000,
      maxRetries: 3,
      rateLimitPerSecond: 100,
    },
  },
  production: {
    logging: {
      level: 'warn',
      enableConsole: true,
      enableFile: true,
      logFile: 'production-places-ingestion.log',
    },
    venues: {
      batchSize: 20,
      delayMs: 500,
      maxRetries: 5,
      rateLimitPerSecond: 200,
    },
  },
};

// Load configuration from environment variables
function loadConfig(): Config {
  let env = (process.env.SUPABASE_ENV || process.env.NODE_ENV || 'staging') as Environment;
  
  // Validate environment
  if (!['staging', 'production', 'development'].includes(env)) {
    console.warn(`Invalid environment: ${env}, defaulting to staging`);
    env = 'staging';
  }

  const config: Config = {
    ...defaultConfig,
    ...environmentOverrides[env],
    environment: env,
    supabase: {
      ...defaultConfig.supabase,
      ...environmentOverrides[env]?.supabase,
      url: process.env.VITE_SUPABASE_URL || 
           process.env.SUPABASE_URL || 
           process.env[`SUPABASE_URL_${env.toUpperCase()}`] || '',
      anonKey: process.env.VITE_SUPABASE_ANON_KEY || 
               process.env.SUPABASE_ANON_KEY || 
               process.env[`SUPABASE_ANON_KEY_${env.toUpperCase()}`] || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 
                     process.env[`SUPABASE_SERVICE_ROLE_KEY_${env.toUpperCase()}`],
    },
    google: {
      ...defaultConfig.google,
      ...environmentOverrides[env]?.google,
      apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || 
              process.env.GOOGLE_MAPS_API_KEY || 
              process.env[`GOOGLE_MAPS_API_KEY_${env.toUpperCase()}`] || '',
      placesApiKey: process.env.GOOGLE_PLACES_API_KEY || 
                   process.env[`GOOGLE_PLACES_API_KEY_${env.toUpperCase()}`],
    },
    venues: {
      ...defaultConfig.venues,
      ...environmentOverrides[env]?.venues,
    },
    logging: {
      ...defaultConfig.logging,
      ...environmentOverrides[env]?.logging,
    },
  };

  // Validate required configuration
  validateConfig(config);

  return config;
}

// Validate configuration
function validateConfig(config: Config): void {
  const errors: string[] = [];

  if (!config.supabase.url) {
    errors.push('SUPABASE_URL is required');
  }
  if (!config.supabase.anonKey) {
    errors.push('SUPABASE_ANON_KEY is required');
  }
  if (!config.google.apiKey) {
    errors.push('GOOGLE_MAPS_API_KEY is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Export configuration instance
export const config = loadConfig();

// Export helper functions
export function isProduction(): boolean {
  return config.environment === 'production';
}

export function isStaging(): boolean {
  return config.environment === 'staging';
}

export function isDevelopment(): boolean {
  return config.environment === 'development';
}

export function getEnvironmentName(): string {
  return config.environment;
}

// Export for testing
export { loadConfig, validateConfig };
