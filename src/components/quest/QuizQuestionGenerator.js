// Utility functions to generate quiz questions with real data
import { getCountryData, getMultipleCountries } from '../../data/countryDataCache';

export const generateFlagQuestion = async (targetCountry) => {
  try {
    // Fetch 3 random countries for wrong answers
    const wrongCountries = await fetchRandomCountries(3, targetCountry.cca3);

    const options = [
      {
        label: targetCountry.name.common,
        flag: targetCountry.flags?.svg || targetCountry.flags?.png,
        isCorrect: true
      },
      ...wrongCountries.map(c => ({
        label: c.name.common,
        flag: c.flags?.svg || c.flags?.png,
        isCorrect: false
      }))
    ];

    // Shuffle options but keep track of correct answer
    return shuffleArray(options);
  } catch (error) {
    console.error('Error generating flag question:', error);
    // Fallback options
    return [
      { label: targetCountry.name.common, flag: targetCountry.flags?.svg, isCorrect: true },
      { label: 'United States', flag: 'https://flagcdn.com/w320/us.svg', isCorrect: false },
      { label: 'France', flag: 'https://flagcdn.com/w320/fr.svg', isCorrect: false },
      { label: 'Japan', flag: 'https://flagcdn.com/w320/jp.svg', isCorrect: false },
    ];
  }
};

export const generateCapitalQuestion = (targetCountry) => {
  const correct = targetCountry.capital?.[0] || 'N/A';
  const commonCapitals = ['London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Tokyo', 'Beijing', 'Moscow'];
  const wrong = commonCapitals.filter(c => c !== correct).slice(0, 3);
  return shuffleArray([correct, ...wrong]);
};

export const generatePopulationQuestion = (targetCountry) => {
  const pop = targetCountry.population;
  const correct = formatPopulation(pop);

  // Generate wrong answers with variations (ensure they're different)
  const variations = [];
  const multipliers = [0.3, 0.7, 1.5, 2, 3];

  for (const mult of multipliers) {
    const variant = formatPopulation(pop * mult);
    if (variant !== correct && !variations.includes(variant)) {
      variations.push(variant);
      if (variations.length >= 3) break;
    }
  }

  // If we don't have enough variations, add some common population values
  while (variations.length < 3) {
    const commonPops = ['1 million', '10 million', '50 million', '100 million', '500 million', '1 billion'];
    const randomPop = commonPops[Math.floor(Math.random() * commonPops.length)];
    if (randomPop !== correct && !variations.includes(randomPop)) {
      variations.push(randomPop);
    }
  }

  return shuffleArray([correct, ...variations.slice(0, 3)]);
};

export const generateLanguageQuestion = (targetCountry) => {
  const languages = Object.values(targetCountry.languages || {});
  const correct = languages[0] || 'N/A';
  const commonLanguages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese'];
  const wrong = commonLanguages.filter(l => !languages.includes(l)).slice(0, 3);
  return shuffleArray([correct, ...wrong]);
};

export const generateNeighborQuestion = async (targetCountry) => {
  if (!targetCountry.borders || targetCountry.borders.length === 0) {
    // Island nations or countries with no borders
    const options = [
      { name: 'None (Island nation)', isCorrect: true },
      { name: 'United States', isCorrect: false },
      { name: 'Canada', isCorrect: false },
      { name: 'Mexico', isCorrect: false },
    ];
    return shuffleArray(options);
  }

  try {
    // Fetch neighbor countries using cached data
    const neighborCodes = targetCountry.borders.slice(0, 1); // Get first neighbor as correct answer
    const neighbors = await getMultipleCountries(neighborCodes);
    const correctNeighbor = neighbors[0]?.name?.common || 'Unknown';

    // Get wrong answers - countries that are definitely not neighbors
    const wrongCodes = ['USA', 'CAN', 'MEX', 'BRA', 'FRA', 'DEU', 'CHN', 'IND', 'JPN', 'AUS'];
    const wrongCountries = await getMultipleCountries(wrongCodes.filter(c =>
      !targetCountry.borders.includes(c) && c !== targetCountry.cca3
    ).slice(0, 3));

    const wrongNames = wrongCountries
      .filter(c => c && c.name?.common)
      .map(c => c.name.common)
      .filter(name => name !== correctNeighbor);

    // Ensure we have 4 options
    while (wrongNames.length < 3) {
      const fallback = ['United States', 'Canada', 'Mexico', 'Brazil', 'France', 'Germany'];
      const random = fallback[Math.floor(Math.random() * fallback.length)];
      if (!wrongNames.includes(random) && random !== correctNeighbor) {
        wrongNames.push(random);
      }
      if (wrongNames.length >= 3) break;
    }

    const options = [
      { name: correctNeighbor, isCorrect: true },
      ...wrongNames.slice(0, 3).map(name => ({ name, isCorrect: false }))
    ];

    return shuffleArray(options);
  } catch (error) {
    console.error('Error generating neighbor question:', error);
    // Fallback
    return [
      { name: 'Unknown', isCorrect: true },
      { name: 'United States', isCorrect: false },
      { name: 'Canada', isCorrect: false },
      { name: 'Mexico', isCorrect: false },
    ];
  }
};

const fetchRandomCountries = async (count, excludeCode) => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const all = await response.json();
    const filtered = all.filter(c => c.cca3 !== excludeCode);
    const shuffled = shuffleArray(filtered);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error fetching random countries:', error);
    return [];
  }
};

const formatPopulation = (pop) => {
  if (pop >= 1000000000) return (pop / 1000000000).toFixed(1) + ' billion';
  if (pop >= 1000000) return (pop / 1000000).toFixed(1) + ' million';
  if (pop >= 1000) return (pop / 1000).toFixed(1) + ' thousand';
  return pop.toString();
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

