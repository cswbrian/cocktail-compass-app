#!/usr/bin/env tsx

/**
 * Test script for Google Places Service
 * Run with: tsx test-google-places.ts
 */

import { GooglePlacesService } from '../src/services/google-places-service';
import { createPlaceSummary, formatDuration } from '../src/utils/utils';
import { config } from '../config';

async function testGooglePlacesService() {
  console.log('🧪 Testing Google Places Service');
  console.log('Environment:', config.environment);
  console.log('Rate limit:', config.venues.rateLimitPerSecond, 'requests/second');
  console.log('---');

  try {
    const service = new GooglePlacesService();
    
    // Test 1: Search for places
    console.log('🔍 Test 1: Searching for bars in Hong Kong...');
    const startTime = Date.now();
    
    const searchResults = await service.searchPlaces('cocktail bar', 'HK');
    const searchDuration = Date.now() - startTime;
    
    console.log(`✅ Found ${searchResults.length} places in ${formatDuration(searchDuration)}`);
    
    if (searchResults.length > 0) {
      const firstPlace = searchResults[0];
      console.log('\n📍 First result:');
      const summary = createPlaceSummary(firstPlace);
      console.log(`  Name: ${summary.title}`);
      console.log(`  Address: ${summary.address}`);
      console.log(`  Contact: ${summary.contact}`);
      console.log(`  Rating: ${summary.rating}`);
      console.log(`  Features: ${summary.features.join(', ')}`);
      console.log(`  Data Completeness: ${summary.completeness}%`);
      
      // Test 2: Get detailed information
      console.log('\n🔍 Test 2: Getting detailed information...');
      const detailStartTime = Date.now();
      
      try {
        const details = await service.getPlaceDetails(firstPlace.place_id);
        const detailDuration = Date.now() - detailStartTime;
        
        console.log(`✅ Retrieved details in ${formatDuration(detailDuration)}`);
        console.log(`  Business Status: ${details.business_status || 'Unknown'}`);
        console.log(`  Phone: ${details.international_phone_number || details.formatted_phone_number || 'Not available'}`);
        console.log(`  Website: ${details.website || 'Not available'}`);
        console.log(`  Types: ${details.types.join(', ')}`);
        
        // Test conversion to Place interface
        console.log('\n🔄 Test 3: Converting to Place interface...');
        const placeData = service.convertToPlace(details);
        console.log(`✅ Converted successfully`);
        console.log(`  Place ID: ${placeData.place_id}`);
        console.log(`  Main Text: ${placeData.main_text}`);
        console.log(`  Secondary Text: ${placeData.secondary_text || 'None'}`);
        console.log(`  Coordinates: (${placeData.lat}, ${placeData.lng})`);
        console.log(`  Data Source: ${placeData.data_source}`);
        
      } catch (error) {
        console.error('❌ Failed to get place details:', error instanceof Error ? error.message : String(error));
      }
    }
    
    // Test 3: API usage statistics
    console.log('\n📊 API Usage Statistics:');
    const stats = service.getUsageStats();
    console.log(`  Total Requests: ${stats.requestCount}`);
    console.log(`  Requests/Second: ${stats.requestsPerSecond}`);
    console.log(`  Elapsed Time: ${formatDuration(stats.elapsedTimeMs)}`);
    console.log(`  Current Rate Limit Window: ${stats.currentRateLimit} requests`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Test failed:', errorMessage);
    if (errorMessage.includes('API key')) {
      console.log('\n💡 Tip: Make sure you have a valid Google Places API key configured in your environment variables:');
      console.log('  - GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY');
      console.log('  - Check your .env file or environment configuration');
    }
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testGooglePlacesService()
    .then(() => {
      console.log('\n🎉 Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test script failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
