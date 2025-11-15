// Local cache of country data to avoid API issues and ensure accuracy
// This will be populated from REST Countries API and stored locally

const countryDataCache = {};

// Function to fetch and cache country data
export const getCountryData = async (isoCode) => {
  // Check cache first
  if (countryDataCache[isoCode]) {
    return countryDataCache[isoCode];
  }

  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${isoCode}`);
    const data = await response.json();
    
    if (data && data[0]) {
      // Store in cache
      countryDataCache[isoCode] = data[0];
      return data[0];
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

