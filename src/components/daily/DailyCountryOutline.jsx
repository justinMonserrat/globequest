import React, { useState, useEffect } from 'react';
import CountryOutlineSVG from './CountryOutlineSVG';

// Popular countries for daily challenges
const countryCodes = ['USA', 'CAN', 'MEX', 'BRA', 'GBR', 'FRA', 'DEU', 'JPN', 'AUS', 'IND', 'CHN', 'RUS', 'ITA', 'ESP', 'ZAF'];

const DailyCountryOutline = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [challengeDate, setChallengeDate] = useState(null);

  // Get today's date in EST/EDT (12:00 PM reset)
  const getTodayEST = () => {
    const now = new Date();
    // Use toLocaleString to get EST/EDT time
    const estString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
    const estDate = new Date(estString);
    return estDate.toDateString();
  };

  // Load saved attempts from localStorage
  useEffect(() => {
    const savedDate = localStorage.getItem('dailyOutlineDate');
    const savedAttempts = parseInt(localStorage.getItem('dailyOutlineAttempts') || '0');
    const savedHasGuessed = localStorage.getItem('dailyOutlineHasGuessed') === 'true';
    const today = getTodayEST();
    
    if (savedDate === today) {
      // Same day, restore progress
      setAttempts(savedAttempts);
      setHasGuessed(savedHasGuessed);
      setChallengeDate(today);
    } else {
      // New day, reset
      setAttempts(0);
      setHasGuessed(false);
      setChallengeDate(today);
      localStorage.setItem('dailyOutlineDate', today);
      localStorage.setItem('dailyOutlineAttempts', '0');
      localStorage.setItem('dailyOutlineHasGuessed', 'false');
    }
  }, []);

  // Select a random country for today (using date as seed for consistency)
  useEffect(() => {
    const fetchCountry = async () => {
      setLoading(true);
      const today = getTodayEST();
      const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const index = seed % countryCodes.length;
      const countryCode = countryCodes[index];

      try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const data = await response.json();
        
        if (data && data[0]) {
          setSelectedCountry({
            name: data[0].name.common,
            code: countryCode,
          });
          setCountryData(data[0]);
        }
      } catch (error) {
        console.error('Error fetching country:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guess.trim() || hasGuessed) return;

    const isCorrect = guess.trim().toLowerCase() === selectedCountry.name.toLowerCase();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    // Save to localStorage
    localStorage.setItem('dailyOutlineAttempts', newAttempts.toString());
    
    if (isCorrect || newAttempts >= maxAttempts) {
      setResult(isCorrect);
      setHasGuessed(true);
      localStorage.setItem('dailyOutlineHasGuessed', 'true');
    } else {
      // Wrong answer but still have tries left
      setResult(false);
      setGuess(''); // Clear input for next try
    }
  };

  if (loading || !selectedCountry) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Guess Today's Country Outline</h3>
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
          <div className="text-center text-gray-500">Loading outline...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Guess Today's Country Outline</h3>
      
      <div className="mb-4">
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[200px] border-2 border-gray-300">
          <div className="text-center w-full">
            {selectedCountry.code && (
              <div className="mb-4 flex justify-center">
                <div className="relative w-full max-w-xs bg-white rounded-lg p-4 border-2 border-gray-200">
                  <CountryOutlineSVG 
                    countryCode={selectedCountry.code}
                    countryName={selectedCountry.name}
                  />
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500">Which country is this?</p>
            {countryData && (
              <p className="text-xs text-gray-400 mt-2">
                Hint: {countryData.region || 'Can you guess?'}
              </p>
            )}
          </div>
        </div>
      </div>

      {!hasGuessed ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter country name..."
              disabled={attempts >= maxAttempts}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Attempts remaining: {maxAttempts - attempts} / {maxAttempts}
            </p>
          </div>
          {result === false && attempts > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                ❌ Incorrect. Try again! ({maxAttempts - attempts} {maxAttempts - attempts === 1 ? 'try' : 'tries'} remaining)
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={attempts >= maxAttempts}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {attempts >= maxAttempts ? 'Show Answer' : 'Submit Guess'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              result
                ? 'bg-green-50 border-2 border-green-500'
                : 'bg-red-50 border-2 border-red-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{result ? '✅' : '❌'}</span>
              <div>
                <p className={`font-semibold ${result ? 'text-green-800' : 'text-red-800'}`}>
                  {result ? 'Correct!' : 'Incorrect'}
                </p>
                {!result && (
                  <p className="text-sm text-red-600 mt-1">
                    The answer was: <strong>{selectedCountry.name}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
          {!result && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 New challenge available tomorrow at 12:00 PM EST!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyCountryOutline;

