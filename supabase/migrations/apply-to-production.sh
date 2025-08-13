#!/bin/bash

# Apply Map Functions Migration to Production
# Usage: ./apply-to-production.sh

set -e  # Exit on any error

echo "🚀 Applying Map Functions Migration to Production..."
echo "⚠️  Make sure you're connected to the PRODUCTION database!"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Confirm production deployment
echo -e "${YELLOW}Are you sure you want to apply this migration to PRODUCTION? (y/N)${NC}"
read -r confirmation

if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Migration cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}📋 Migration Details:${NC}"
echo "  - File: 20250110_001_create_map_functions.sql"
echo "  - Functions: places_in_viewport, nearby_places, places_by_region"
echo "  - Prerequisites: PostGIS extension enabled"
echo ""

# Check if supabase CLI is available
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI detected${NC}"
    echo -e "${YELLOW}Applying migration via Supabase CLI...${NC}"
    
    # Apply migration using Supabase CLI
    supabase db push
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migration applied successfully via Supabase CLI!${NC}"
    else
        echo -e "${RED}❌ Migration failed via Supabase CLI${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI not found${NC}"
    echo -e "${YELLOW}Please apply the migration manually:${NC}"
    echo ""
    echo "1. Go to your Supabase Dashboard → SQL Editor"
    echo "2. Copy and paste the contents of:"
    echo "   supabase/migrations/20250110_001_create_map_functions.sql"
    echo "3. Execute the migration"
    echo ""
    echo "Or use psql directly:"
    echo "psql -h YOUR_DB_HOST -U postgres -d postgres -f supabase/migrations/20250110_001_create_map_functions.sql"
fi

echo ""
echo -e "${GREEN}🧪 Test the migration with these queries:${NC}"
echo ""
echo "-- Test viewport function (Central Hong Kong)"
echo "SELECT * FROM places_in_viewport(22.2, 22.3, 114.1, 114.2, 5);"
echo ""
echo "-- Test nearby places function (1km around Central)"
echo "SELECT * FROM nearby_places(22.2849, 114.1577, 1, 5);"
echo ""
echo "-- Test region function"
echo "SELECT * FROM places_by_region('hongkong', 5);"
echo ""
echo -e "${GREEN}🎉 Migration complete!${NC}"
