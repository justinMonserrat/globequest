// Local cache of country data to avoid API issues and ensure accuracy
// Uses both in-memory cache and localStorage for persistence

const countryDataCache = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const STORAGE_KEY = 'globequest_country_cache';

// Load cache from localStorage on initialization
const loadCacheFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      // Only use cache if not expired
      if (parsed.timestamp && (now - parsed.timestamp) < CACHE_EXPIRY) {
        Object.assign(countryDataCache, parsed.data);
      } else {
        // Clear expired cache
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('Error loading cache from storage:', error);
  }
};

// Save cache to localStorage
const saveCacheToStorage = () => {
  try {
    const cacheData = {
      timestamp: Date.now(),
      data: countryDataCache
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving cache to storage:', error);
    // If storage is full, clear old entries
    if (error.name === 'QuotaExceededError') {
      // Clear half of the cache
      const keys = Object.keys(countryDataCache);
      keys.slice(0, Math.floor(keys.length / 2)).forEach(key => {
        delete countryDataCache[key];
      });
      saveCacheToStorage();
    }
  }
};

// Initialize cache from storage
loadCacheFromStorage();

// Function to fetch and cache country data
export const getCountryData = async (isoCode) => {
  // Check in-memory cache first
  if (countryDataCache[isoCode]) {
    return countryDataCache[isoCode];
  }

  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${isoCode}`);
    const data = await response.json();

    if (data && data[0]) {
      // Store in cache (only essential fields to save space)
      const essentialData = {
        cca3: data[0].cca3,
        name: data[0].name,
        capital: data[0].capital,
        population: data[0].population,
        languages: data[0].languages,
        borders: data[0].borders,
        flags: data[0].flags,
        region: data[0].region,
        subregion: data[0].subregion,
      };
      countryDataCache[isoCode] = essentialData;
      saveCacheToStorage();
      return essentialData;
    }
  } catch (error) {
    console.error(`Error fetching country data for ${isoCode}:`, error);
  }

  return null;
};

// Function to get multiple countries at once
export const getMultipleCountries = async (isoCodes) => {
  const promises = isoCodes.map(code => getCountryData(code));
  return Promise.all(promises);
};

// Pre-populate cache with common countries (optional - can be expanded)
export const preloadCommonCountries = async () => {
  const commonCodes = ['USA', 'CAN', 'MEX', 'GBR', 'FRA', 'DEU', 'JPN', 'CHN', 'IND', 'BRA'];
  await getMultipleCountries(commonCodes);
};

export default countryDataCache;

