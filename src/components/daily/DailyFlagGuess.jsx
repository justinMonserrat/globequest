import React, { useState, useEffect } from 'react';

// Popular countries for daily challenges
const countryCodes = ['USA', 'CAN', 'MEX', 'BRA', 'GBR', 'FRA', 'DEU', 'JPN', 'AUS', 'IND', 'CHN', 'RUS', 'ITA', 'ESP', 'ZAF'];

const DailyFlagGuess = () => {
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [flagImage, setFlagImage] = useState(null);
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
    const savedDate = localStorage.getItem('dailyFlagDate');
    const savedAttempts = parseInt(localStorage.getItem('dailyFlagAttempts') || '0');
    const savedHasGuessed = localStorage.getItem('dailyFlagHasGuessed') === 'true';
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
      localStorage.setItem('dailyFlagDate', today);
      localStorage.setItem('dailyFlagAttempts', '0');
      localStorage.setItem('dailyFlagHasGuessed', 'false');
    }
  }, []);

  // Select a random country for today (using date as seed for consistency)
  useEffect(() => {
    const fetchFlag = async () => {
      setLoading(true);
      const today = getTodayEST();
      const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const index = (seed + 1) % countryCodes.length;
      const countryCode = countryCodes[index];

      try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const data = await response.json();
        
        if (data && data[0]) {
          setSelectedFlag({
            name: data[0].name.common,
            code: countryCode,
          });
          setFlagImage(data[0].flags.svg || data[0].flags.png);
        }
      } catch (error) {
        console.error('Error fetching flag:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlag();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guess.trim() || hasGuessed) return;

    const isCorrect = guess.trim().toLowerCase() === selectedFlag.name.toLowerCase();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    // Save to localStorage
    localStorage.setItem('dailyFlagAttempts', newAttempts.toString());
    
    if (isCorrect || newAttempts >= maxAttempts) {
      setResult(isCorrect);
      setHasGuessed(true);
      localStorage.setItem('dailyFlagHasGuessed', 'true');
    } else {
      // Wrong answer but still have tries left
      setResult(false);
      setGuess(''); // Clear input for next try
    }
  };

  if (loading || !selectedFlag) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Guess Today's Flag</h3>
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
          <div className="text-center text-gray-500">Loading flag...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Guess Today's Flag</h3>
      
      <div className="mb-4">
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[200px] border-2 border-gray-300">
          <div className="text-center w-full">
            {flagImage && (
              <img
                src={flagImage}
                alt="Country flag"
                className="mx-auto max-w-full h-32 object-contain mb-4 shadow-md rounded"
                style={{ aspectRatio: '3/2' }}
              />
            )}
            <p className="text-sm text-gray-500">Which country is this?</p>
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
                    The answer was: <strong>{selectedFlag.name}</strong>
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

export default DailyFlagGuess;

