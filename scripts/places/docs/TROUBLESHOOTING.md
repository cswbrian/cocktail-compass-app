# Google Places API Troubleshooting Guide

## Issue: API Keys with Referer Restrictions

### Problem
```
API Status: REQUEST_DENIED
Error: API keys with referer restrictions cannot be used with this API.
```

### Root Cause
Your Google API key has HTTP referrer (domain) restrictions that prevent server-side usage. These restrictions are designed for web applications and don't work with command-line tools.

### Solution Options

#### Option 1: Remove Restrictions (Quick Fix)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your existing API key
3. Under "Application restrictions":
   - Change from "HTTP referrers (web sites)" 
   - To "None"
4. Click "Save"
5. Wait 1-2 minutes for changes to propagate

#### Option 2: Create Server-Side API Key (Recommended)
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. Copy the new API key
4. Click on the key to configure it:
   - **Application restrictions**: Leave as "None"
   - **API restrictions**: Select "Restrict key" and choose "Places API"
5. Save the configuration

#### Option 3: Use Different Keys for Different Environments
```bash
# Web application (with referrer restrictions)
VITE_GOOGLE_MAPS_API_KEY=your_web_restricted_key

# Server-side/CLI tools (no restrictions)
GOOGLE_PLACES_API_KEY=your_server_side_key
```

### Security Considerations

**For Production:**
- Use separate API keys for web vs server environments
- Web keys: Restrict to your domain (e.g., `yourdomain.com/*`)
- Server keys: Restrict by IP if possible, or use service accounts

**For Development:**
- Unrestricted keys are okay for local development
- Consider using daily/monthly quotas as additional protection

### Environment Variable Setup

Add to your `.env` file:
```bash
# For server-side CLI tools (no restrictions needed)
GOOGLE_PLACES_API_KEY=your_unrestricted_api_key

# For web application (with domain restrictions)
VITE_GOOGLE_MAPS_API_KEY=your_restricted_web_key
```

### Testing After Fix

1. **Test Configuration**:
   ```bash
   pnpm run test-config
   ```

2. **Test Simple API Access**:
   ```bash
   pnpm run test-simple
   ```

3. **Test Full Google Places Service**:
   ```bash
   pnpm run test-google-places
   ```

### Expected Output After Fix

```
🧪 Simple Places API Test
==========================
Environment: staging
API Key: AIzaSyBa...tR40

🔍 Test 1: Text Search for bars in Hong Kong...
Status: 200 OK
Results found: 20
API Status: OK

📍 First result:
  Name: The Old Man
  Address: 2/F, 32 Aberdeen St, Central, Hong Kong
  Place ID: ChIJ7cv00DwBBDQRdwjMnkP9EAs
  Rating: 4.5
  Types: bar, establishment, food

🔍 Test 2: Getting place details...
Details Status: 200 OK
  Phone: +852 2234 5678
  Website: https://theoldman.hk
  Business Status: OPERATIONAL
  Price Level: 3

✅ Tests completed successfully!
```

## Common Issues & Solutions

### Issue: REQUEST_DENIED
**Cause**: API key restrictions, billing not enabled, or API not enabled
**Solution**: Check restrictions, enable billing, enable Places API

### Issue: ZERO_RESULTS
**Cause**: Query too specific, location-based restrictions
**Solution**: Try broader search terms, check geographic restrictions

### Issue: OVER_QUERY_LIMIT
**Cause**: Exceeded daily quota or rate limits
**Solution**: Check quotas in Google Cloud Console, implement rate limiting

### Issue: INVALID_REQUEST
**Cause**: Missing required parameters, invalid place_id
**Solution**: Check API documentation, validate input parameters

## Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [API Credentials](https://console.cloud.google.com/apis/credentials)
- [Places API Library](https://console.cloud.google.com/apis/library/places-backend.googleapis.com)
- [Billing Setup](https://console.cloud.google.com/billing)
- [API Quotas](https://console.cloud.google.com/iam-admin/quotas)

## Need More Help?

1. Check the Google Cloud Console logs for detailed error messages
2. Verify your billing account is active and has sufficient credit
3. Ensure the Places API is enabled for your project
4. Test with a simple curl command to isolate issues

```bash
# Test API key directly
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant&key=YOUR_API_KEY"
```
