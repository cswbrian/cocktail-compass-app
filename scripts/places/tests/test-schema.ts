#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

async function testEnhancedSchema() {
  console.log('🗄️ Testing Enhanced Places Table Schema');
  console.log('=====================================\n');

  try {
    // Test 1: Check if new columns exist
    console.log('1️⃣ Testing new columns existence...');
    const { data: columns, error: columnsError } = await supabase
      .from('places')
      .select('phone_number, website, rating, price_level, place_types, is_open')
      .limit(1);

    if (columnsError) {
      console.log('❌ Error accessing new columns:', columnsError.message);
      console.log('💡 This might mean the migration hasn\'t been applied yet');
      return;
    }

    console.log('✅ New columns are accessible!');
    console.log('Sample data structure:', columns);

    // Test 2: Test the enhanced functions
    console.log('\n2️⃣ Testing enhanced database functions...');
    
    // Test places_by_rating function
    try {
      const { data: ratingResults, error: ratingError } = await supabase
        .rpc('places_by_rating', { 
          min_rating: 4.0, 
          max_rating: 5.0, 
          result_limit: 5 
        });

      if (ratingError) {
        console.log('⚠️ places_by_rating function not available yet:', ratingError.message);
      } else {
        console.log('✅ places_by_rating function working!');
        console.log(`Found ${ratingResults?.length || 0} places with rating 4.0+`);
      }
    } catch (error) {
      console.log('⚠️ places_by_rating function not available yet');
    }

    // Test places_by_type function
    try {
      const { data: typeResults, error: typeError } = await supabase
        .rpc('places_by_type', { 
          place_type: 'bar', 
          result_limit: 5 
        });

      if (typeError) {
        console.log('⚠️ places_by_type function not available yet:', typeError.message);
      } else {
        console.log('✅ places_by_type function working!');
        console.log(`Found ${typeResults?.length || 0} bars`);
      }
    } catch (error) {
      console.log('⚠️ places_by_type function not available yet');
    }

    // Test 3: Check indexes
    console.log('\n3️⃣ Checking database indexes...');
    const { data: indexes, error: indexError } = await supabase
      .rpc('pg_indexes', { 
        tablename: 'places' 
      });

    if (indexError) {
      console.log('⚠️ Cannot check indexes (requires elevated permissions):', indexError.message);
    } else {
      console.log('✅ Indexes check available');
      const newIndexes = indexes?.filter((idx: any) => 
        idx.indexname.includes('rating') || 
        idx.indexname.includes('price') || 
        idx.indexname.includes('types')
      );
      console.log(`Found ${newIndexes?.length || 0} new performance indexes`);
    }

    // Test 4: Test data insertion (if we have write permissions)
    console.log('\n4️⃣ Testing data insertion...');
    const testPlace = {
      name: 'Test Enhanced Place',
      place_id: `test_${Date.now()}`,
      main_text: 'Test Address',
      lat: 22.3193,
      lng: 114.1694,
      region: 'hongkong',
      phone_number: '+852 1234 5678',
      website: 'https://test.example.com',
      rating: 4.5,
      price_level: 2,
      place_types: ['bar', 'restaurant'],
      business_status: 'OPERATIONAL',
      data_source: 'test'
    };

    try {
      const { data: insertResult, error: insertError } = await supabase
        .from('places')
        .insert(testPlace)
        .select()
        .single();

      if (insertError) {
        console.log('⚠️ Cannot insert test data:', insertError.message);
        console.log('💡 This might be due to permissions or constraints');
      } else {
        console.log('✅ Test data insertion successful!');
        console.log('Inserted place ID:', insertResult.id);
        
        // Clean up test data
        const { error: deleteError } = await supabase
          .from('places')
          .delete()
          .eq('id', insertResult.id);
        
        if (deleteError) {
          console.log('⚠️ Could not clean up test data:', deleteError.message);
        } else {
          console.log('✅ Test data cleaned up');
        }
      }
    } catch (error) {
      console.log('⚠️ Data insertion test failed:', error);
    }

    console.log('\n🎯 Schema Test Summary:');
    console.log('✅ New columns are accessible');
    console.log('⚠️ Some functions may not be available yet (migration pending)');
    console.log('⚠️ Index checks require elevated permissions');
    console.log('⚠️ Data insertion depends on permissions and constraints');

    console.log('\n📋 Next Steps:');
    console.log('1. Apply the migration: supabase/migrations/20250113_001_enhance_places_table.sql');
    console.log('2. Test the enhanced functions again');
    console.log('3. Verify all indexes are created');
    console.log('4. Test with real Google Places API data');

  } catch (error) {
    console.error('❌ Schema test failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your Supabase connection');
    console.log('2. Verify the migration has been applied');
    console.log('3. Check your database permissions');
  }
}

// Run the test
testEnhancedSchema().catch(console.error);
