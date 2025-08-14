# CLI Confirmation Specification - Places Ingestion

## 🎯 Overview

Interactive command-line interface for reviewing and confirming place details before upserting to Supabase. This ensures data quality and gives you full control over what gets added to your database.

## 🔄 Confirmation Flow

### 1. Individual Place Confirmation

For each place found via Google Places API, display comprehensive details and ask for confirmation:

```
🔍 Searching for: "The Old Man"
✅ Found 1 candidate place

📍 Place Details
==========================================
Name: The Old Man
Place ID: ChIJX7WOe8gBBDQRKGpKVGZGKLM
Address: 2/F, 32 Aberdeen Street, Central, Hong Kong
Location: 22.2849, 114.1577
Region: hongkong

📞 Contact Information
Phone: +852 2234 5678
Website: https://theoldman.hk
Google Maps: https://goo.gl/maps/abc123

⭐ Ratings & Reviews
Rating: 4.5/5 (120 reviews)
Price Level: $$$ (3/4)

🕒 Opening Hours
Monday: 5:00 PM – 2:00 AM
Tuesday: 5:00 PM – 2:00 AM
Wednesday: 5:00 PM – 2:00 AM
Thursday: 5:00 PM – 2:00 AM
Friday: 5:00 PM – 2:00 AM
Saturday: 5:00 PM – 2:00 AM
Sunday: 5:00 PM – 2:00 AM
Currently: OPEN

🏷️ Place Types
bar, establishment, food, point_of_interest

✨ Features
• Cocktails: Yes
• Outdoor Seating: Yes
• Live Music: No
• Wheelchair Accessible: Yes
• Dine In: Yes
• Takeout: No

📊 Data Completeness: 95% (9/10 fields)

Action: INSERT (new place)
Confirm adding this place to database? (y/N/s/q): 
```

### 2. Update Confirmation

When a place already exists in the database:

```
📍 Place Details (UPDATE)
==========================================
Name: The Old Man
Place ID: ChIJX7WOe8gBBDQRKGpKVGZGKLM
Status: EXISTS IN DATABASE

📋 Changes to be made:
+ Phone: +852 2234 5678 (new)
+ Website: https://theoldman.hk (new)
+ Rating: 4.3 → 4.5 (updated)
+ Reviews: 115 → 120 (updated)
+ Opening Hours: Updated schedule
~ Last Updated: 2025-01-01 → 2025-01-13

Action: UPDATE (existing place)
Confirm updating this place? (y/N/s/q): 
```

### 3. Batch Confirmation

Before processing a batch of places:

```
📋 Batch Processing Summary
==========================================
Input File: hong-kong-bars.json
Total Places: 25

🆕 New Places (15):
• The Old Man
• Quinary
• COA
• Penicillin
• Bar 4567
... (10 more)

🔄 Updates (8):
• Ophelia (rating update)
• The Envoy (phone number added)
• Pontiac (opening hours updated)
... (5 more)

⏭️ Skipped (2):
• Duplicate: "Bar ABC" (matches existing Place ID)
• Invalid: "Unknown Bar" (no Google Places match)

📊 Data Quality:
• Average Completeness: 87%
• Complete Records (>90%): 18/23
• Needs Review (<70%): 2/23

Estimated Processing Time: ~45 seconds
API Calls Required: 23 (within limits)

Proceed with batch processing? (y/N/q): 
```

## 🎮 User Input Options

### Single Place Confirmation
- **`y` or `Y`**: Confirm and proceed with this place
- **`n` or `N`**: Skip this place and continue
- **`s` or `S`**: Show more details (photos, reviews, etc.)
- **`e` or `E`**: Edit place information before saving
- **`q` or `Q`**: Quit the entire process

### Batch Confirmation
- **`y` or `Y`**: Proceed with entire batch
- **`n` or `N`**: Review places individually
- **`q` or `Q`**: Quit without processing

### Advanced Options
- **`d` or `D`**: Show detailed diff for updates
- **`j` or `J`**: Show raw JSON data
- **`r` or `R`**: Retry Google Places search with different query

## 🛠 Implementation Specification

### CLI Confirmation Class
```typescript
interface ConfirmationOptions {
  showDetails?: boolean;
  allowEdit?: boolean;
  batchMode?: boolean;
  autoConfirm?: boolean;
}

class CLIConfirmation {
  private rl: readline.Interface;
  
  async confirmPlace(
    place: PlaceData, 
    action: 'INSERT' | 'UPDATE',
    existing?: PlaceData
  ): Promise<ConfirmationResult> {
    // Display place details
    this.displayPlaceDetails(place, action, existing);
    
    // Get user input
    const response = await this.getUserInput();
    
    // Handle response
    return this.handleResponse(response, place);
  }
  
  async confirmBatch(
    places: PlaceData[],
    summary: BatchSummary
  ): Promise<boolean> {
    // Display batch summary
    this.displayBatchSummary(summary);
    
    // Get confirmation
    return await this.getBatchConfirmation();
  }
  
  private displayPlaceDetails(
    place: PlaceData, 
    action: string,
    existing?: PlaceData
  ): void {
    console.log(`\n📍 Place Details${action === 'UPDATE' ? ' (UPDATE)' : ''}`);
    console.log('='.repeat(42));
    console.log(`Name: ${place.name}`);
    console.log(`Place ID: ${place.place_id}`);
    console.log(`Address: ${place.formatted_address}`);
    console.log(`Location: ${place.lat}, ${place.lng}`);
    
    if (place.phone_number) {
      console.log(`\n📞 Contact Information`);
      console.log(`Phone: ${place.phone_number}`);
    }
    
    if (place.website) {
      console.log(`Website: ${place.website}`);
    }
    
    if (place.rating) {
      console.log(`\n⭐ Ratings & Reviews`);
      console.log(`Rating: ${place.rating}/5 (${place.user_ratings_total} reviews)`);
    }
    
    if (place.opening_hours) {
      console.log(`\n🕒 Opening Hours`);
      this.displayOpeningHours(place.opening_hours);
    }
    
    if (place.place_types?.length) {
      console.log(`\n🏷️ Place Types`);
      console.log(place.place_types.join(', '));
    }
    
    // Show changes for updates
    if (action === 'UPDATE' && existing) {
      console.log(`\n📋 Changes to be made:`);
      this.displayChanges(existing, place);
    }
    
    const completeness = this.calculateCompleteness(place);
    console.log(`\n📊 Data Completeness: ${completeness}%`);
    
    console.log(`\nAction: ${action} (${action === 'INSERT' ? 'new place' : 'existing place'})`);
  }
  
  private async getUserInput(): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(
        'Confirm? (y/N/s=show more/e=edit/q=quit): ',
        (answer) => resolve(answer.toLowerCase().trim())
      );
    });
  }
  
  private displayChanges(existing: PlaceData, updated: PlaceData): void {
    const changes: string[] = [];
    
    // Compare fields and show differences
    Object.keys(updated).forEach(key => {
      const oldValue = existing[key];
      const newValue = updated[key];
      
      if (oldValue !== newValue) {
        if (oldValue === undefined || oldValue === null) {
          changes.push(`+ ${key}: ${newValue} (new)`);
        } else if (newValue === undefined || newValue === null) {
          changes.push(`- ${key}: ${oldValue} (removed)`);
        } else {
          changes.push(`~ ${key}: ${oldValue} → ${newValue} (updated)`);
        }
      }
    });
    
    changes.forEach(change => console.log(change));
  }
  
  private calculateCompleteness(place: PlaceData): number {
    const totalFields = [
      'name', 'place_id', 'formatted_address', 'lat', 'lng',
      'phone_number', 'website', 'rating', 'opening_hours', 'place_types'
    ];
    
    const completedFields = totalFields.filter(field => 
      place[field] !== undefined && place[field] !== null
    );
    
    return Math.round((completedFields.length / totalFields.length) * 100);
  }
}
```

### Error Handling
```typescript
class ConfirmationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ConfirmationError';
  }
}

// Handle different error scenarios
try {
  const result = await confirmation.confirmPlace(place, 'INSERT');
} catch (error) {
  if (error instanceof ConfirmationError) {
    switch (error.code) {
      case 'USER_QUIT':
        console.log('👋 Process cancelled by user');
        break;
      case 'INVALID_INPUT':
        console.log('❌ Invalid input, please try again');
        break;
      default:
        console.log(`❌ Confirmation error: ${error.message}`);
    }
  }
}
```

## 📋 Command Line Integration

### Confirmation Mode Options
```bash
# Interactive confirmation (default)
pnpm tsx scripts/places/ingest-places.ts --input places.json

# Auto-confirm all (skip confirmations)
pnpm tsx scripts/places/ingest-places.ts --input places.json --confirm

# Batch confirmation only (no individual confirmations)
pnpm tsx scripts/places/ingest-places.ts --input places.json --batch-confirm

# Dry run with preview (no database changes)
pnpm tsx scripts/places/ingest-places.ts --input places.json --dry-run
```

## 🎨 Visual Design

### Color Coding (if terminal supports colors)
- 🟢 **Green**: Successful operations, confirmations
- 🔴 **Red**: Errors, warnings, cancellations  
- 🔵 **Blue**: Information, headers, place names
- 🟡 **Yellow**: Updates, changes, warnings
- ⚪ **White**: Default text, details

### Progress Indicators
```
🔍 Searching places... [████████████████████████████████] 100% (25/25)

📍 Processing places:
✅ The Old Man (inserted)
✅ Quinary (updated) 
⏭️  COA (skipped - duplicate)
❌ Unknown Bar (error - not found)
🔄 Penicillin (processing...)

📊 Progress: 4/5 complete | Success: 80% | ETA: 30s
```

---

*CLI Confirmation Specification - Places Ingestion*  
*Part of Cocktail Compass App - Map Feature*  
*Last Updated: January 13, 2025*
