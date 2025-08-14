#!/usr/bin/env tsx

import { config, isStaging, isProduction, isDevelopment, getEnvironmentName } from '../config';

console.log('🔧 Places Data Ingestion Configuration Test');
console.log('==========================================\n');

try {
  console.log('✅ Configuration loaded successfully!');
  console.log(`Environment: ${getEnvironmentName()}`);
  console.log(`Is Staging: ${isStaging()}`);
  console.log(`Is Production: ${isProduction()}`);
  console.log(`Is Development: ${isDevelopment()}`);
  
  console.log('\n📊 Configuration Details:');
  console.log(`Supabase URL: ${config.supabase.url ? '✅ Set' : '❌ Missing'}`);
  console.log(`Supabase Anon Key: ${config.supabase.anonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`Google Maps API Key: ${config.google.apiKey ? '✅ Set' : '❌ Missing'}`);
  
  console.log('\n⚙️ Processing Settings:');
  console.log(`Batch Size: ${config.venues.batchSize}`);
  console.log(`Delay (ms): ${config.venues.delayMs}`);
  console.log(`Max Retries: ${config.venues.maxRetries}`);
  console.log(`Rate Limit: ${config.venues.rateLimitPerSecond}/sec`);
  
  console.log('\n📝 Logging Configuration:');
  console.log(`Level: ${config.logging.level}`);
  console.log(`Console: ${config.logging.enableConsole ? 'Enabled' : 'Disabled'}`);
  console.log(`File: ${config.logging.enableFile ? 'Enabled' : 'Disabled'}`);
  if (config.logging.logFile) {
    console.log(`Log File: ${config.logging.logFile}`);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Copy env.template to .env');
  console.log('2. Fill in your API keys and Supabase credentials');
  console.log('3. Run this test again to verify configuration');
  
} catch (error) {
  console.error('❌ Configuration Error:');
  console.error(error);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Check that you have a .env file in this directory');
  console.log('2. Verify all required environment variables are set');
  console.log('3. Ensure .env file is not committed to version control');
}
