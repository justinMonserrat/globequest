# Data Strategy: API vs Database Storage

## REST Countries API - What We Can Pull

### Available Endpoints:
1. **`/v3.1/alpha/{code}`** - Single country by ISO code
2. **`/v3.1/all`** - All countries (use with `fields` parameter to limit data)
3. **`/v3.1/name/{name}`** - Search by country name

### Data Fields Available from API:

#### Static/Reference Data (changes rarely):
- `name.common` - Common country name
- `name.official` - Official country name
- `cca2`, `cca3` - ISO country codes (2-letter, 3-letter)
- `capital` - Array of capital cities
- `region` - Geographic region (e.g., "Americas", "Europe")
- `subregion` - Sub-region (e.g., "North America", "Western Europe")
- `languages` - Object of language codes to names
- `currencies` - Object of currency codes to details
- `area` - Land area in km²
- `borders` - Array of ISO3 codes of neighboring countries
- `flag` - Unicode flag emoji
- `flags.svg`, `flags.png` - Flag image URLs
- `coatOfArms.svg`, `coatOfArms.png` - Coat of arms URLs
- `timezones` - Array of timezone strings
- `continents` - Array of continents
- `maps.googleMaps`, `maps.openStreetMaps` - Map URLs

#### Dynamic Data (changes more frequently):
- `population` - Current population (changes but slowly)
- `demonyms` - Demonym names
- `car.side` - Which side of road they drive on
- `postalCode` - Postal code format

#### Current Usage in GlobeQuest:
1. **Quiz Questions:**
   - Flag images (`flags.svg`)
   - Capital city (`capital[0]`)
   - Population (`population`)
   - Languages (`languages`)
   - Neighbors (`borders`)

2. **Country Info Display:**
   - Name, capital, population, languages, neighbors, region

3. **Daily Challenges:**
   - Country selection and flag images

4. **Profile Customization:**
   - Country list for dropdowns

---

## What We Should Store in Supabase

### ✅ MUST Store (User-Specific Data):

1. **User Progress:**
   - `profiles` table: XP, level, display_name, avatar_url, preferences
   - `country_progress` table: Quiz results, unlock status per country
   - `region_progress` table: Completion percentage per region

2. **User Preferences:**
   - Country they're from
   - Favorite flag
   - Country to visit
   - Countries visited list

### ⚠️ CONSIDER Storing (Static Reference Data):

**Option 1: Store in Supabase (Recommended for Production)**
- **Pros:**
  - Faster queries (no API calls)
  - No rate limiting issues
  - Works offline
  - Can update data independently of API
  - Better performance

- **Cons:**
  - Need to maintain/update data
  - Takes database space
  - Initial setup required

**Option 2: Keep Fetching from API (Current Approach)**
- **Pros:**
  - Always up-to-date
  - No database maintenance
  - Less database storage

- **Cons:**
  - Rate limiting (REST Countries has limits)
  - Slower (network requests)
  - API dependency
  - Multiple redundant calls

---

## Recommended Approach

### Store in Supabase:
1. **Country Reference Table** - Store essential static data:
   ```sql
   CREATE TABLE countries (
     code VARCHAR(3) PRIMARY KEY, -- ISO3 code (e.g., 'USA')
     name_common TEXT,
     name_official TEXT,
     capital TEXT[],
     region TEXT,
     subregion TEXT,
     population BIGINT,
     area FLOAT,
     borders TEXT[], -- Array of ISO3 codes
     languages JSONB, -- {eng: "English", spa: "Spanish"}
     flag_emoji TEXT,
     flag_svg_url TEXT,
     flag_png_url TEXT,
     updated_at TIMESTAMP
   );
   ```

2. **Store Only Essential Fields:**
   - `code` (ISO3) - Primary key
   - `name_common` - For display
   - `capital` - For quiz questions
   - `population` - For quiz questions
   - `languages` - For quiz questions
   - `borders` - For neighbor questions
   - `flag_svg_url` - For flags
   - `region`, `subregion` - For organization

### Keep Fetching from API:
- **Flag images** - Use CDN (flagcdn.com) instead of storing
- **All countries list** - Only fetch when needed (profile dropdowns)
- **Random countries** - For quiz wrong answers (can cache locally)

---

## Implementation Strategy

### Phase 1: Optimize Current Approach
1. **Improve caching:**
   - Use localStorage for country data cache
   - Cache for 24 hours
   - Reduce redundant API calls

2. **Batch API calls:**
   - Fetch multiple countries at once when possible
   - Use `/v3.1/all?fields=...` to limit data

### Phase 2: Add Supabase Country Table (Optional)
1. **Create migration:**
   - Store essential country data
   - Populate from API initially
   - Update periodically (monthly)

2. **Update code:**
   - Check Supabase first
   - Fallback to API if not found
   - Background sync to update data

---

## Current Data Flow

### Quiz Flow:
1. User clicks country → Fetch from API → Generate quiz → Store results in Supabase

### Profile Flow:
1. Load profile → Fetch country list from API → Display in dropdowns

### Daily Challenges:
1. Select country (deterministic) → Fetch from API → Display

---

## Recommendations

### Immediate (No Database Changes):
1. ✅ **Keep current approach** - It works
2. ✅ **Improve caching** - Add localStorage persistence
3. ✅ **Reduce API calls** - Batch requests where possible

### Future (If Scaling):
1. **Add countries table** - Store static reference data
2. **Background sync job** - Update country data monthly
3. **Hybrid approach** - Supabase for common data, API for edge cases

---

## API Rate Limits

REST Countries API (free tier):
- No official rate limit stated
- Recommended: ~10 requests/second max
- Current usage: ~5-10 requests per quiz session

**Risk:** If we scale, we might hit limits. Consider caching or Supabase storage.

