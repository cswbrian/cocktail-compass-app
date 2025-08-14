#!/usr/bin/env tsx

/**
 * API Diagnostic Script for Google Places
 * Helps identify configuration issues
 */

import { config } from './config.ts';

async function diagnoseGooglePlacesAPI() {
  console.log('🔍 Google Places API Diagnostic');
  console.log('================================');
  
  // Check basic configuration
  console.log('\n📋 Configuration Check:');
  console.log(`Environment: ${config.environment}`);
  console.log(`Google API Key: ${config.google.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`Places API Key: ${config.google.placesApiKey ? '✅ Set' : '❌ Missing'}`);
  
  const apiKey = config.google.placesApiKey || config.google.apiKey;
  
  if (!apiKey) {
    console.log('\n❌ No API key found. Please set GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY');
    return;
  }
  
  console.log(`\nUsing API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  
  // Test basic API connectivity
  console.log('\n🌐 Testing API Connectivity...');
  
  try {
    // Test with a simple HTTP request to check basic API access
    const testUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant&key=${apiKey}`;
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log('✅ API is accessible');
      console.log(`Results found: ${data.results?.length || 0}`);
      
      if (data.results && data.results.length > 0) {
        console.log(`Sample result: ${data.results[0].name}`);
      }
    } else {
      console.log('❌ API Error:');
      console.log(`Error Status: ${data.error_message || data.status}`);
      
      // Provide specific guidance based on error
      if (response.status === 403) {
        console.log('\n💡 403 Forbidden - Common solutions:');
        console.log('1. Enable Places API in Google Cloud Console');
        console.log('2. Check API key restrictions');
        console.log('3. Ensure billing is enabled');
        console.log('4. Verify API key has Places API access');
      } else if (response.status === 429) {
        console.log('\n💡 429 Too Many Requests - Rate limit exceeded');
      } else if (response.status === 400) {
        console.log('\n💡 400 Bad Request - Check API key format');
      }
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error instanceof Error ? error.message : String(error));
  }
  
  console.log('\n🔗 Helpful Links:');
  console.log('• Google Cloud Console: https://console.cloud.google.com/');
  console.log('• Enable Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com');
  console.log('• API Credentials: https://console.cloud.google.com/apis/credentials');
  console.log('• Billing Setup: https://console.cloud.google.com/billing');
}

// Run the diagnostic
if (import.meta.url === `file://${process.argv[1]}`) {
  diagnoseGooglePlacesAPI()
    .then(() => {
      console.log('\n🎯 Diagnostic complete');
    })
    .catch((error) => {
      console.error('\n💥 Diagnostic failed:', error instanceof Error ? error.message : String(error));
    });
}
