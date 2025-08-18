import { promises as fs } from 'fs';
import { join } from 'path';
import { PlaceInput } from '../types/types';

export interface PlaceInventoryItem {
  name: string;
  google_place_id: string;
  last_fetched: string; // ISO date string
  address?: string;
  rating?: number;
  types?: string[];
  tags?: string[];
  description?: string;
  show_on_map?: boolean;
}

export interface PlaceInventory {
  version: string;
  last_updated: string;
  places: PlaceInventoryItem[];
}

export class PlaceInventoryService {
  private inventoryPath: string;
  private inventory: PlaceInventory;
  private readonly INVENTORY_VERSION = '1.0';

  constructor(inventoryPath: string = 'place-inventory.json') {
    this.inventoryPath = inventoryPath;
    this.inventory = {
      version: this.INVENTORY_VERSION,
      last_updated: new Date().toISOString(),
      places: []
    };
  }

  /**
   * Load existing inventory from file
   */
  async loadInventory(): Promise<void> {
    try {
      const data = await fs.readFile(this.inventoryPath, 'utf-8');
      this.inventory = JSON.parse(data);
      
      // Validate inventory structure
      if (!this.inventory.version || !this.inventory.places) {
        throw new Error('Invalid inventory format');
      }
      
      console.log(`📚 Loaded inventory: ${this.inventory.places.length} places`);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        console.log(`📚 No existing inventory found, creating new one: ${this.inventoryPath}`);
        await this.saveInventory();
      } else {
        console.warn(`⚠️  Failed to load inventory: ${error instanceof Error ? error.message : String(error)}`);
        console.log('📚 Creating new inventory...');
        await this.saveInventory();
      }
    }
  }

  /**
   * Save inventory to file
   */
  async saveInventory(): Promise<void> {
    try {
      this.inventory.last_updated = new Date().toISOString();
      await fs.writeFile(this.inventoryPath, JSON.stringify(this.inventory, null, 2));
    } catch (error) {
      console.error(`❌ Failed to save inventory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if a place exists in inventory by name or place ID
   */
  findPlace(identifier: string): PlaceInventoryItem | undefined {
    return this.inventory.places.find(place => 
      place.name.toLowerCase() === identifier.toLowerCase() ||
      place.google_place_id === identifier
    );
  }

  /**
   * Check if a place exists by place ID
   */
  hasPlaceId(placeId: string): boolean {
    return this.inventory.places.some(place => place.google_place_id === placeId);
  }

  /**
   * Check if a place exists by name
   */
  hasPlaceName(name: string): boolean {
    return this.inventory.places.some(place => 
      place.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Add or update a place in inventory
   */
  async addPlace(place: PlaceInventoryItem): Promise<void> {
    const existingIndex = this.inventory.places.findIndex(p => 
      p.google_place_id === place.google_place_id
    );

    if (existingIndex >= 0) {
      // Update existing place
      this.inventory.places[existingIndex] = {
        ...this.inventory.places[existingIndex],
        ...place,
        last_fetched: new Date().toISOString()
      };
      console.log(`📚 Updated inventory: ${place.name}`);
    } else {
      // Add new place
      this.inventory.places.push({
        ...place,
        last_fetched: new Date().toISOString()
      });
      console.log(`📚 Added to inventory: ${place.name}`);
    }

    await this.saveInventory();
  }

  /**
   * Add multiple places to inventory
   */
  async addPlaces(places: PlaceInventoryItem[]): Promise<void> {
    for (const place of places) {
      await this.addPlace(place);
    }
  }

  /**
   * Get all places from inventory
   */
  getAllPlaces(): PlaceInventoryItem[] {
    return [...this.inventory.places];
  }

  /**
   * Export inventory to CSV format
   */
  async exportToCSV(outputPath: string = 'place-inventory.csv'): Promise<void> {
    try {
      const csvHeader = 'name,google_place_id,last_fetched,address,rating,types,tags,description,show_on_map\n';
      const csvRows = this.inventory.places.map(place => {
        const types = place.types?.join(';') || '';
        const tags = place.tags?.join(';') || '';
        return `"${place.name}","${place.google_place_id}","${place.last_fetched}","${place.address || ''}","${place.rating || ''}","${types}","${tags}","${place.description || ''}","${place.show_on_map || true}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;
      await fs.writeFile(outputPath, csvContent, 'utf-8');
      console.log(`📄 Inventory exported to CSV: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to export inventory to CSV: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get inventory statistics
   */
  getStats(): { total: number; byDate: Record<string, number> } {
    const byDate: Record<string, number> = {};
    
    this.inventory.places.forEach(place => {
      const date = place.last_fetched.split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return {
      total: this.inventory.places.length,
      byDate
    };
  }

  /**
   * Clean up old entries (optional)
   */
  async cleanupOldEntries(daysOld: number = 365): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const originalCount = this.inventory.places.length;
    this.inventory.places = this.inventory.places.filter(place => {
      const lastFetched = new Date(place.last_fetched);
      return lastFetched > cutoffDate;
    });

    const removedCount = originalCount - this.inventory.places.length;
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} old inventory entries`);
      await this.saveInventory();
    }
  }

  /**
   * Search inventory by various criteria
   */
  searchInventory(query: string): PlaceInventoryItem[] {
    const lowerQuery = query.toLowerCase();
    return this.inventory.places.filter(place => 
      place.name.toLowerCase().includes(lowerQuery) ||
      place.address?.toLowerCase().includes(lowerQuery) ||
      place.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      place.description?.toLowerCase().includes(lowerQuery)
    );
  }
}
