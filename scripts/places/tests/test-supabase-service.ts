#!/usr/bin/env tsx

/**
 * Test script for Supabase Place Service
 * Run with: tsx test-supabase-service.ts
 */

import { SupabasePlaceService } from '../src/services/supabase-place-service';
import { GooglePlacesService } from '../src/services/google-places-service';
import { formatDuration } from '../src/utils/utils';
import { config } from '../config';

async function testSupabasePlaceService() {
  console.log('🗄️ Testing Supabase Place Service');
  console.log('Environment:', config.environment);
  console.log('Project ID: ucxtfzzgxzqhqtflrhad');
  console.log('---');

  try {
    const supabaseService = new SupabasePlaceService();
    const googleService = new GooglePlacesService();
    
    // Test 1: Database Connection and Stats
    console.log('📊 Test 1: Database connection and statistics...');
    const startTime = Date.now();
    
    const stats = await supabaseService.getStats();
    const statsDuration = Date.now() - startTime;
    
    console.log(`✅ Connected successfully in ${formatDuration(statsDuration)}`);
    console.log(`  Total Places: ${stats.totalPlaces}`);
    console.log(`  Verified Places: ${stats.verifiedPlaces}`);
    console.log(`  Average Rating: ${stats.averageRating}`);
    console.log(`  By Region:`, Object.entries(stats.placesByRegion).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None');
    console.log(`  Note: Region-based statistics are deprecated and will be removed in future versions`);
    console.log(`  By Source:`, Object.entries(stats.placesByDataSource).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None');
    
    // Test 2: Search existing places
    console.log('\n🔍 Test 2: Searching existing places...');
    const searchStartTime = Date.now();
    
    const existingPlaces = await supabaseService.searchPlaces('bar', 'hongkong', 5);
    const searchDuration = Date.now() - searchStartTime;
    
    console.log(`✅ Found ${existingPlaces.length} existing places in ${formatDuration(searchDuration)}`);
    
    if (existingPlaces.length > 0) {
      const firstPlace = existingPlaces[0];
      console.log(`  Example: ${firstPlace.name} (${firstPlace.place_id})`);
      console.log(`  Rating: ${firstPlace.rating || 'N/A'}, Address: ${firstPlace.formatted_address || 'N/A'}`);
    }

    // Test 3: Get a place from Google Places API and test upsert
    console.log('\n🔄 Test 3: Google Places API integration and upsert...');
    const googleStartTime = Date.now();
    
    // Use searchNearbyWithDetails to get full opening hours data
    const googlePlaces = await googleService.searchNearbyWithDetails(22.2819, 114.1577, 2000, 'bar', 5);
    const googleDuration = Date.now() - googleStartTime;
    
    if (googlePlaces.length > 0) {
      console.log(`✅ Found ${googlePlaces.length} places from Google in ${formatDuration(googleDuration)}`);
      
      // Use the second place which we know has opening hours (based on debug output)
      const testPlace = googlePlaces[1] || googlePlaces[0];
      console.log(`\n📍 Testing with: ${testPlace.name}`);
      
      // Convert to place data
      const placeData = supabaseService.convertGooglePlaceToPlaceData(testPlace, 'hongkong');
      
      // Test upsert
      const upsertStartTime = Date.now();
      const upsertResult = await supabaseService.upsertPlace(placeData, 'merge');
      const upsertDuration = Date.now() - upsertStartTime;
      
      console.log(`✅ Upsert completed in ${formatDuration(upsertDuration)}`);
      console.log(`  Result: ${upsertResult.type}`);
      console.log(`  Place ID: ${upsertResult.data?.place_id || 'N/A'}`);
      console.log(`  Changes: +${upsertResult.changes?.added.length} -${upsertResult.changes?.updated.length} =${upsertResult.changes?.unchanged.length}`);
      
      // Check opening hours data
      if (testPlace.opening_hours) {
        console.log(`  📅 Opening Hours: ${testPlace.opening_hours.weekday_text ? 'Full schedule available' : 'Basic info only'}`);
        if (testPlace.opening_hours.periods) {
          console.log(`    Time periods: ${testPlace.opening_hours.periods.length} days`);
        }
        if (testPlace.opening_hours.weekday_text) {
          console.log(`    Human readable: ${testPlace.opening_hours.weekday_text.length} entries`);
        }
      } else {
        console.log(`  📅 No opening hours data from Google Places API`);
      }
      
      // Test duplicate detection
      console.log('\n🔍 Test 4: Duplicate detection...');
      const duplicateStartTime = Date.now();
      
      const exists = await supabaseService.existsByPlaceId(testPlace.place_id);
      const duplicateDuration = Date.now() - duplicateStartTime;
      
      console.log(`✅ Duplicate check completed in ${formatDuration(duplicateDuration)}`);
      console.log(`  Place exists: ${exists ? 'Yes' : 'No'}`);
      
      if (exists) {
        // Test getting the place
        const retrievedPlace = await supabaseService.getByPlaceId(testPlace.place_id);
        if (retrievedPlace) {
          console.log(`  Retrieved: ${retrievedPlace.name}`);
          console.log(`  Last Updated: ${retrievedPlace.last_updated}`);
          console.log(`  Data Source: ${retrievedPlace.data_source}`);
          
          // Check opening hours in database
          if (retrievedPlace.opening_hours) {
            console.log(`  📅 Database Opening Hours:`);
            if (retrievedPlace.opening_hours.weekday_text) {
              console.log(`    Full schedule: ${retrievedPlace.opening_hours.weekday_text.length} days`);
              // Show first few entries
              retrievedPlace.opening_hours.weekday_text.slice(0, 3).forEach((text: string, i: number) => {
                console.log(`      ${i + 1}. ${text}`);
              });
              if (retrievedPlace.opening_hours.weekday_text.length > 3) {
                console.log(`      ... and ${retrievedPlace.opening_hours.weekday_text.length - 3} more`);
              }
            } else if (retrievedPlace.opening_hours.open_now !== undefined) {
              console.log(`    Basic info: Open now = ${retrievedPlace.opening_hours.open_now}`);
            } else {
              console.log(`    Raw data: ${JSON.stringify(retrievedPlace.opening_hours)}`);
            }
          } else {
            console.log(`  📅 No opening hours data in database`);
          }
        }
      }
      
      // Test 5: Audit trail
      if (exists) {
        console.log('\n📋 Test 5: Audit trail...');
        const auditStartTime = Date.now();
        
        const auditTrail = await supabaseService.getAuditTrail(testPlace.place_id);
        const auditDuration = Date.now() - auditStartTime;
        
        console.log(`✅ Audit trail retrieved in ${formatDuration(auditDuration)}`);
        console.log(`  Created: ${auditTrail.created_at}`);
        console.log(`  Updated: ${auditTrail.updated_at}`);
        console.log(`  Last Updated: ${auditTrail.last_updated}`);
        console.log(`  Source: ${auditTrail.data_source}`);
      }
    } else {
      console.log('⚠️ No places found from Google Places API');
    }

    // Test 6: Nearby search
    console.log('\n🌍 Test 6: Nearby places search...');
    const nearbyStartTime = Date.now();
    
    // Central Hong Kong coordinates
    const centralHK = { lat: 22.2819, lng: 114.1577 };
    const nearbyPlaces = await supabaseService.getPlacesNearby(
      centralHK.lat, 
      centralHK.lng, 
      2, // 2km radius
      5  // limit to 5 results
    );
    const nearbyDuration = Date.now() - nearbyStartTime;
    
    console.log(`✅ Found ${nearbyPlaces.length} nearby places in ${formatDuration(nearbyDuration)}`);
    
    if (nearbyPlaces.length > 0) {
      nearbyPlaces.forEach((place, index) => {
        console.log(`  ${index + 1}. ${place.name} (${place.distance}km away)`);
      });
    }

    // Test 7: Rating search
    console.log('\n⭐ Test 7: Places by rating...');
    const ratingStartTime = Date.now();
    
    const highRatedPlaces = await supabaseService.getPlacesByRating(4.0, 5.0, 'hongkong', 5);
    const ratingDuration = Date.now() - ratingStartTime;
    
    console.log(`✅ Found ${highRatedPlaces.length} highly rated places in ${formatDuration(ratingDuration)}`);
    
    if (highRatedPlaces.length > 0) {
      highRatedPlaces.forEach((place, index) => {
        console.log(`  ${index + 1}. ${place.name} (${place.rating}/5 stars)`);
      });
    }

    // Final stats
    console.log('\n📊 Final Database Statistics:');
    const finalStats = await supabaseService.getStats();
    console.log(`  Total Places: ${finalStats.totalPlaces}`);
    console.log(`  Verified Places: ${finalStats.verifiedPlaces}`);
    console.log(`  Average Rating: ${finalStats.averageRating}`);
    
    console.log('\n✅ All Supabase Place Service tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.message.includes('Failed to insert place')) {
      console.log('\n💡 Tip: This might be due to:');
      console.log('  - Missing database schema (run migrations)');
      console.log('  - Insufficient permissions on Supabase');
      console.log('  - Network connectivity issues');
    }
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabasePlaceService()
    .then(() => {
      console.log('\n🎉 Supabase service test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test script failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
