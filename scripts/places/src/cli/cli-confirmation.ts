import { GooglePlaceDetails } from '../types/types';

// Interactive CLI confirmation system
export class CliConfirmation {
  private readonly readline: any;

  constructor() {
    this.readline = require('readline');
  }

  /**
   * Display place details in a readable format
   */
  displayPlaceDetails(
    place: GooglePlaceDetails,
    action: 'insert' | 'update' | 'skip',
    dataCompleteness: number,
    manualTags?: string[]
  ): void {
    console.log('\n' + '='.repeat(80));
    
    // Header with action type
    const actionIcon = action === 'insert' ? '🆕' : action === 'update' ? '🔄' : '⏭️';
    const actionText = action === 'insert' ? 'New Place' : action === 'update' ? 'Update Place' : 'Skip Place';
    console.log(`${actionIcon} ${actionText}: ${place.name}`);
    console.log('='.repeat(80));

    // Basic Information
    console.log(`📍 Address: ${place.formatted_address || 'Not available'}`);
    
    // Contact Information
    if (place.formatted_phone_number || place.international_phone_number) {
      const phone = place.international_phone_number || place.formatted_phone_number;
      console.log(`📞 Phone: ${phone}`);
    }
    
    if (place.website) {
      console.log(`🌐 Website: ${place.website}`);
    }

    // Ratings and Reviews
    if (place.rating) {
      const stars = '⭐'.repeat(Math.floor(place.rating)) + '☆'.repeat(5 - Math.floor(place.rating));
      const reviews = place.user_ratings_total ? ` (${place.user_ratings_total} reviews)` : '';
      console.log(`⭐ Rating: ${stars} ${place.rating}/5${reviews}`);
    }

    if (place.price_level !== undefined) {
      const priceSymbols = '$'.repeat(place.price_level + 1);
      console.log(`💰 Price: ${priceSymbols}`);
    }

    // Business Hours
    if (place.opening_hours) {
      if (place.opening_hours.weekday_text && place.opening_hours.weekday_text.length > 0) {
        console.log(`🕒 Hours: ${place.opening_hours.weekday_text[0]}`);
        if (place.opening_hours.weekday_text.length > 1) {
          console.log(`      ${place.opening_hours.weekday_text.slice(1, 3).join(' | ')}`);
          if (place.opening_hours.weekday_text.length > 3) {
            console.log(`      ... and ${place.opening_hours.weekday_text.length - 3} more days`);
          }
        }
      } else if (place.opening_hours.open_now !== undefined) {
        const status = place.opening_hours.open_now ? '🟢 Open Now' : '🔴 Closed';
        console.log(`🕒 Status: ${status}`);
      }
    }

    // Manual Tags
    if (manualTags && manualTags.length > 0) {
      console.log(`🏷️  Tags: ${manualTags.join(', ')}`);
    }

    // Place Types and Features
    if (place.types && place.types.length > 0) {
      const relevantTypes = place.types.filter(type => 
        ['bar', 'restaurant', 'night_club', 'cafe', 'food'].includes(type)
      );
      if (relevantTypes.length > 0) {
        console.log(`🏷️  Type: ${relevantTypes.join(', ')}`);
      }
    }

    if (place.business_status) {
      const statusIcon = place.business_status === 'OPERATIONAL' ? '🟢' : '🔴';
      console.log(`📊 Status: ${statusIcon} ${place.business_status}`);
    }

    // Data Completeness Score
    console.log(`📊 Data Completeness: ${dataCompleteness}%`);
    
    // Action Summary
    console.log('\n' + '-'.repeat(80));
    if (action === 'insert') {
      console.log(`💾 Action: Will INSERT new place into database`);
    } else if (action === 'update') {
      console.log(`🔄 Action: Will UPDATE existing place in database`);
    } else {
      console.log(`⏭️  Action: Will SKIP this place (already exists)`);
    }
    console.log('='.repeat(80));
  }

  /**
   * Calculate data completeness score (0-100%)
   */
  calculateDataCompleteness(place: GooglePlaceDetails): number {
    const fields = [
      'name',
      'formatted_address',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'rating',
      'user_ratings_total',
      'price_level',
      'types',
      'business_status',
      'opening_hours',
    ];

    let completedFields = 0;
    let totalFields = fields.length;

    for (const field of fields) {
      const value = (place as any)[field];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          completedFields++;
        } else if (typeof value === 'object' && Object.keys(value).length > 0) {
          completedFields++;
        } else if (typeof value === 'string' && value.trim().length > 0) {
          completedFields++;
        } else if (typeof value === 'number') {
          completedFields++;
        } else if (typeof value === 'boolean') {
          completedFields++;
        }
      }
    }

    return Math.round((completedFields / totalFields) * 100);
  }

  /**
   * Get user confirmation for a single place
   */
  async confirmPlace(
    place: GooglePlaceDetails,
    action: 'insert' | 'update' | 'skip',
    manualTags?: string[]
  ): Promise<boolean> {
    const dataCompleteness = this.calculateDataCompleteness(place);
    this.displayPlaceDetails(place, action, dataCompleteness, manualTags);

    if (action === 'skip') {
      console.log('\n⏭️  This place already exists and will be skipped.');
      return true;
    }

    const prompt = `\nConfirm ${action}? (y/N/s=show more/q=quit): `;
    const answer = await this.getUserInput(prompt);

    switch (answer.toLowerCase()) {
      case 'y':
      case 'yes':
        return true;
      case 'n':
      case 'no':
      case '':
        return false;
      case 's':
      case 'show':
        this.showDetailedPlaceInfo(place);
        return await this.confirmPlace(place, action, manualTags);
      case 'q':
      case 'quit':
        console.log('\n👋 Exiting...');
        process.exit(0);
      default:
        console.log('❓ Invalid input. Please enter y, n, s, or q.');
        return await this.confirmPlace(place, action);
    }
  }

  /**
   * Show detailed place information
   */
  private showDetailedPlaceInfo(place: GooglePlaceDetails): void {
    console.log('\n📋 Detailed Place Information:');
    console.log('-'.repeat(50));
    
    // All place types
    if (place.types && place.types.length > 0) {
      console.log(`🏷️  All Types: ${place.types.join(', ')}`);
    }

    // Full opening hours
    if (place.opening_hours && place.opening_hours.weekday_text) {
      console.log('\n🕒 Full Opening Hours:');
      place.opening_hours.weekday_text.forEach((text: string, index: number) => {
        console.log(`   ${index + 1}. ${text}`);
      });
    }

    // Geometry information
    if (place.geometry && place.geometry.location) {
      console.log(`\n📍 Coordinates: ${place.geometry.location.lat}, ${place.geometry.location.lng}`);
    }

    // Google URL
    if (place.url) {
      console.log(`🔗 Google Maps: ${place.url}`);
    }

    console.log('-'.repeat(50));
  }

  /**
   * Get batch confirmation for multiple places
   */
  async confirmBatch(
    places: GooglePlaceDetails[],
    actions: ('insert' | 'update' | 'skip')[]
  ): Promise<boolean> {
    console.log('\n📦 Batch Confirmation Summary:');
    console.log('='.repeat(60));
    
    const summary = {
      insert: 0,
      update: 0,
      skip: 0,
      total: places.length,
    };

    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      const action = actions[i];
      summary[action]++;
      
      const actionIcon = action === 'insert' ? '🆕' : action === 'update' ? '🔄' : '⏭️';
      const dataCompleteness = this.calculateDataCompleteness(place);
      console.log(`${actionIcon} ${place.name} (${dataCompleteness}% complete) - ${action.toUpperCase()}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary: ${summary.insert} insert, ${summary.update} update, ${summary.skip} skip`);
    console.log(`💾 Total database operations: ${summary.insert + summary.update}`);
    
    const prompt = `\nProceed with batch processing? (y/N/q=quit): `;
    const answer = await this.getUserInput(prompt);

    switch (answer.toLowerCase()) {
      case 'y':
      case 'yes':
        return true;
      case 'n':
      case 'no':
      case '':
        return false;
      case 'q':
      case 'quit':
        console.log('\n👋 Exiting...');
        process.exit(0);
      default:
        console.log('❓ Invalid input. Please enter y, n, or q.');
        return await this.confirmBatch(places, actions);
    }
  }

  /**
   * Get user input with prompt
   */
  private async getUserInput(prompt: string): Promise<string> {
    const rl = this.readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(prompt, (answer: string) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  /**
   * Display processing summary
   */
  displaySummary(results: {
    total: number;
    processed: number;
    inserted: number;
    updated: number;
    skipped: number;
    errors: number;
  }): void {
    console.log('\n🎉 Processing Complete!');
    console.log('='.repeat(50));
    console.log(`📊 Total Places: ${results.total}`);
    console.log(`✅ Processed: ${results.processed}`);
    console.log(`🆕 Inserted: ${results.inserted}`);
    console.log(`🔄 Updated: ${results.updated}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    console.log(`❌ Errors: ${results.errors}`);
    
    const successRate = results.total > 0 ? Math.round(((results.inserted + results.updated) / results.total) * 100) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (results.errors > 0) {
      console.log(`\n⚠️  ${results.errors} places had errors. Check the logs for details.`);
    }
    
    console.log('='.repeat(50));
  }
}
