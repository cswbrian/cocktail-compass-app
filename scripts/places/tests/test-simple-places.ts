#!/usr/bin/env tsx

/**
 * Simple Places API test without the google-maps-services library
 * Tests basic functionality with direct HTTP requests
 */

import { config } from '../config';

async function testSimplePlacesAPI() {
  console.log('🧪 Simple Places API Test');
  console.log('==========================');
  
  const apiKey = config.google.placesApiKey || config.google.apiKey;
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  console.log(`Environment: ${config.environment}`);
  console.log(`API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  
  // Test 1: Text Search
  console.log('\n🔍 Test 1: Text Search for bars in Hong Kong...');
  try {
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=bar+hong+kong&key=${apiKey}`;
    
    const response = await fetch(textSearchUrl);
    const data = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Results found: ${data.results?.length || 0}`);
    
    if (data.status) {
      console.log(`API Status: ${data.status}`);
    }
    
    if (data.error_message) {
      console.log(`Error: ${data.error_message}`);
    }
    
    if (data.results && data.results.length > 0) {
      const firstPlace = data.results[0];
      console.log('\n📍 First result:');
      console.log(`  Name: ${firstPlace.name}`);
      console.log(`  Address: ${firstPlace.formatted_address}`);
      console.log(`  Place ID: ${firstPlace.place_id}`);
      console.log(`  Rating: ${firstPlace.rating || 'N/A'}`);
      console.log(`  Types: ${firstPlace.types?.join(', ') || 'N/A'}`);
      
      // Test 2: Place Details
      console.log('\n🔍 Test 2: Getting place details...');
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${firstPlace.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,price_level,types,business_status&key=${apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      console.log(`Details Status: ${detailsResponse.status} ${detailsResponse.statusText}`);
      
      if (detailsData.result) {
        const place = detailsData.result;
        console.log(`  Phone: ${place.formatted_phone_number || 'N/A'}`);
        console.log(`  Website: ${place.website || 'N/A'}`);
        console.log(`  Business Status: ${place.business_status || 'N/A'}`);
        console.log(`  Price Level: ${place.price_level || 'N/A'}`);
      }
      
      console.log('\n✅ Tests completed successfully!');
    } else {
      console.log('\n⚠️ No results found. This might be due to:');
      console.log('1. API key restrictions (only allows certain types of requests)');
      console.log('2. Billing not enabled for Places API');
      console.log('3. Geographic restrictions on the API key');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
  }
  
  // Test 3: Check API quotas and usage
  console.log('\n📊 API Key Information:');
  console.log('• Make sure Places API is enabled in Google Cloud Console');
  console.log('• Verify billing is set up and active');
  console.log('• Check that API key has no domain/IP restrictions that would block this request');
  console.log('• Ensure daily quota limits are not exceeded');
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testSimplePlacesAPI()
    .then(() => {
      console.log('\n🎉 Simple test completed');
    })
    .catch((error) => {
      console.error('\n💥 Simple test failed:', error instanceof Error ? error.message : String(error));
    });
}
