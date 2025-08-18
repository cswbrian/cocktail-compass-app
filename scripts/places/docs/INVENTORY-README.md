# 📚 Place Inventory System

## Overview

The Place Inventory System is a cost-saving feature that tracks all Google Places API calls you've made, allowing you to avoid duplicate API requests and significantly reduce costs over time.

## 🚀 **Key Benefits**

### **Cost Savings**
- **Skip expensive Text Search API calls** for places you've already processed
- **Automatic place ID lookup** from previous runs
- **65% cost reduction** when using place IDs
- **Additional savings** when using inventory system

### **Data Management**
- **Persistent storage** of all place data
- **Automatic updates** when re-processing places
- **Export to CSV** for external use
- **Search and filtering** capabilities

## 📊 **Cost Comparison**

| Method | API Calls | Cost per Place | Cost for 100 Places |
|--------|------------|----------------|---------------------|
| **Text Search + Details** | 2 | $0.049 USD | $4.90 USD (~38.3 HKD) |
| **Place ID Only** | 1 | $0.017 USD | $1.70 USD (~13.3 HKD) |
| **Inventory + Details** | 1 | $0.017 USD | $1.70 USD (~13.3 HKD) |

**Total Savings**: Up to **65%** per place!

## 🔧 **How It Works**

### **1. First Run (Builds Inventory)**
```bash
# Process places and build inventory
tsx ingest-places.ts --input places.json --use-inventory --inventory-file place-inventory.json
```

### **2. Subsequent Runs (Uses Inventory)**
```bash
# Re-process same places - much cheaper!
tsx ingest-places.ts --input places.json --use-inventory --inventory-file place-inventory.json
```

### **3. Inventory Lookup Process**
```
Input Place → Check Inventory → Found? → Use Place ID → Skip Text Search
                ↓
            Not Found? → Text Search → Add to Inventory
```

## 📁 **File Structure**

```
scripts/places/
├── place-inventory.json          # Main inventory file (auto-created)
├── place-inventory.csv           # Exported CSV (optional)
├── manage-inventory.ts           # Inventory management CLI
└── src/services/
    └── place-inventory-service.ts # Core inventory logic
```

## 🛠️ **Usage Examples**

### **Basic Ingestion with Inventory**
```bash
# Enable inventory system
tsx ingest-places.ts --input my-bars.json --use-inventory

# Use custom inventory file
tsx ingest-places.ts --input my-bars.json --use-inventory --inventory-file custom-inventory.json
```

### **Export Inventory to CSV**
```bash
# Export current inventory
tsx ingest-places.ts --export-inventory --output my-places.csv

# Export with custom inventory file
tsx ingest-places.ts --export-inventory --inventory-file custom.json --output export.csv
```

### **Inventory Management Commands**
```bash
# List all places in inventory
pnpm run inventory:list

# Search inventory
pnpm run inventory:search --query "cocktail"

# Show statistics
pnpm run inventory:stats

# Export to CSV
pnpm run inventory:export --output my-places.csv

# Clean up old entries
pnpm run inventory:cleanup --days-old 180
```

## 📋 **Inventory Data Structure**

### **JSON Format**
```json
{
  "version": "1.0",
  "last_updated": "2025-01-15T10:30:00.000Z",
  "places": [
    {
      "name": "The Old Man",
      "google_place_id": "ChIJ7cv00DwBBDQRdwjMnkP9EAs",
      "last_fetched": "2025-01-15T10:30:00.000Z",
      "address": "2/F, 32 Aberdeen St, Central, Hong Kong",
      "rating": 4.5,
      "types": ["bar", "establishment", "food"],
      "tags": ["speakeasy", "craft cocktails"],
      "description": "Hidden gem in Soho",
      "show_on_map": true
    }
  ]
}
```

### **CSV Export Format**
```csv
name,google_place_id,last_fetched,address,rating,types,tags,description,show_on_map
"The Old Man","ChIJ7cv00DwBBDQRdwjMnkP9EAs","2025-01-15T10:30:00.000Z","2/F, 32 Aberdeen St, Central, Hong Kong","4.5","bar;establishment;food","speakeasy;craft cocktails","Hidden gem in Soho",true
```

## 🔍 **Advanced Features**

### **Smart Place Matching**
- **Name-based lookup** (case-insensitive)
- **Place ID lookup** (exact match)
- **Fuzzy search** for similar names

### **Automatic Updates**
- **Overwrites existing entries** when re-processing
- **Updates timestamps** for tracking
- **Preserves custom tags** and descriptions

### **Data Validation**
- **Required fields** validation
- **Automatic cleanup** of old entries
- **Error handling** for corrupted data

## 💡 **Best Practices**

### **1. Always Use Inventory for Repeated Runs**
```bash
# ✅ Good: Use inventory to save costs
tsx ingest-places.ts --input places.json --use-inventory

# ❌ Avoid: Re-process without inventory
tsx ingest-places.ts --input places.json
```

### **2. Regular Inventory Exports**
```bash
# Export weekly for backup
tsx ingest-places.ts --export-inventory --output weekly-backup-$(date +%Y%m%d).csv
```

### **3. Clean Up Old Entries**
```bash
# Remove entries older than 6 months
pnpm run inventory:cleanup --days-old 180
```

### **4. Use Descriptive Inventory Files**
```bash
# Separate inventories for different regions
tsx ingest-places.ts --input hong-kong-bars.json --use-inventory --inventory-file hk-inventory.json
tsx ingest-places.ts --input tokyo-bars.json --use-inventory --inventory-file tokyo-inventory.json
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Inventory File Not Found**
```bash
# Error: No existing inventory found, creating new one
# Solution: This is normal for first run
```

#### **Inventory Corruption**
```bash
# Delete corrupted file and restart
rm place-inventory.json
tsx ingest-places.ts --input places.json --use-inventory
```

#### **Memory Issues with Large Inventories**
```bash
# Clean up old entries
pnpm run inventory:cleanup --days-old 90

# Or split into smaller files
tsx ingest-places.ts --input places.json --use-inventory --inventory-file inventory-part1.json
```

### **Performance Tips**
- **Keep inventory files** under 10MB for optimal performance
- **Regular cleanup** of old entries
- **Use specific inventory files** for different datasets

## 📈 **Cost Tracking**

### **Monitor Savings**
The system automatically tracks and reports cost savings:
```
💰 Cost Analysis:
   Places found by place ID: 25 (saved $0.800 USD)
   Places found by inventory: 15 (saved $0.480 USD)
   Places found by text search: 10
   Total API calls: 50
   💡 Total cost saved: $1.280 USD (~9.98 HKD)
```

### **ROI Calculation**
- **Initial setup**: 100 places = $4.90 USD
- **Subsequent runs**: 100 places = $1.70 USD
- **Savings per run**: $3.20 USD (~25.0 HKD)
- **Break-even**: After 2-3 runs

## 🔮 **Future Enhancements**

- **Cloud storage** for inventory files
- **Multi-user inventory** sharing
- **Advanced search** and filtering
- **Inventory analytics** and reporting
- **Automatic backup** to cloud services

## 📞 **Support**

For questions or issues with the inventory system:
1. Check this documentation
2. Review the troubleshooting section
3. Check the main README for general ingestion help
4. Review error logs for specific issues

---

**💡 Pro Tip**: Start using the inventory system from your first run to maximize cost savings over time!
