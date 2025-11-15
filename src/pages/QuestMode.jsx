import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import WorldMap from '../components/WorldMap';
import CountryInfo from '../components/CountryInfo';
import QuizModal from '../components/quest/QuizModal';
import regions from '../data/regions';
import {
  saveCountryProgress,
  updateRegionProgress,
  getCountryProgress,
  getRegionProgress,
  updateUserProfile,
  getUserProfile,
} from '../lib/supabaseProgress';

const QuestMode = () => {
  const { user } = useAuth();
  
  // Start with only North America countries available (but locked)
  const [availableCountries, setAvailableCountries] = useState(['USA', 'CAN', 'MEX']);
  const [quizzedCountries, setQuizzedCountries] = useState(new Set()); // Countries that have been quizzed
  const [unlockedCountries, setUnlockedCountries] = useState(new Set()); // Countries unlocked for review
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentRegionIndex, setCurrentRegionIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [showWorldView, setShowWorldView] = useState(false); // Toggle between region zoom and world view
  const [loadingProgress, setLoadingProgress] = useState(true);

  const currentRegion = regions[currentRegionIndex];

  // Load user progress from Supabase on mount
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!user) {
        setLoadingProgress(false);
        return;
      }

      try {
        // Load country progress
        const countryProgress = await getCountryProgress(user.id);
        const unlocked = new Set();
        const quizzed = new Set();
        
        countryProgress.forEach(progress => {
          if (progress.quiz_passed) {
            unlocked.add(progress.country_code);
          }
          quizzed.add(progress.country_code);
        });
        
        setUnlockedCountries(unlocked);
        setQuizzedCountries(quizzed);
        
        // Load user profile for XP
        const profile = await getUserProfile(user.id);
        if (profile?.xp) {
          setXp(profile.xp);
        }
        
        // Determine current region based on progress
        const regionProgress = await getRegionProgress(user.id);
        if (regionProgress && regionProgress.length > 0) {
          // Find the highest unlocked region
          const sortedRegions = regionProgress
            .filter(r => r.completion_percentage >= 80)
            .sort((a, b) => {
              const aIndex = regions.findIndex(r => r.name === a.region_name);
              const bIndex = regions.findIndex(r => r.name === b.region_name);
              return bIndex - aIndex;
            });
          
          if (sortedRegions.length > 0) {
            const lastUnlocked = sortedRegions[0];
            const nextRegionIndex = regions.findIndex(r => r.name === lastUnlocked.region_name) + 1;
            if (nextRegionIndex < regions.length) {
              setCurrentRegionIndex(nextRegionIndex);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user progress:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    loadUserProgress();
  }, [user]);

  // Calculate region progress
  const calculateRegionProgress = () => {
    const regionCountries = currentRegion?.countries || [];
    const completed = regionCountries.filter(code => 
      unlockedCountries.has(code)
    ).length;
    return regionCountries.length > 0 ? (completed / regionCountries.length) * 100 : 0;
  };

  const regionProgress = calculateRegionProgress();
  const canUnlockNext = currentRegion?.nextRegion && regionProgress >= 80;

  // Fetch country data when selected
  useEffect(() => {
    if (selectedCountry && !countryData) {
      fetch(`https://restcountries.com/v3.1/alpha/${selectedCountry}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0]) {
            setCountryData(data[0]);
          }
        })
        .catch(err => console.error('Error fetching country:', err));
    }
  }, [selectedCountry, countryData]);

  const handleCountrySelect = async (isoCode) => {
    // Check if country is available in current region
    if (!availableCountries.includes(isoCode)) {
      return; // Country not available yet
    }

    // Check if already unlocked (can view info)
    if (unlockedCountries.has(isoCode)) {
      setSelectedCountry(isoCode);
      setCountryData(null); // Force refetch
      setShowQuiz(false);
      return;
    }

    // Check if needs quiz
    if (!quizzedCountries.has(isoCode)) {
      setSelectedCountry(isoCode);
      // Fetch country data for quiz
      try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${isoCode}`);
        const data = await response.json();
        if (data && data[0]) {
          setCountryData(data[0]);
          setShowQuiz(true);
        }
      } catch (error) {
        console.error('Error fetching country data:', error);
      }
    } else {
      // Already quizzed but failed - show message
      setSelectedCountry(isoCode);
      setCountryData(null);
      setShowQuiz(false);
    }
  };

  const handleQuizComplete = async (passed, score, total) => {
    setShowQuiz(false);
    
    if (!user) return;
    
    const timesQuizzed = quizzedCountries.has(selectedCountry) ? 2 : 1;
    
    // Save to Supabase
    try {
      await saveCountryProgress(user.id, selectedCountry, currentRegion.name, {
        passed,
        score,
        total,
        timesQuizzed,
      });
    } catch (error) {
      console.error('Error saving country progress:', error);
    }
    
    if (passed) {
      // Unlock country for review
      setUnlockedCountries(prev => new Set([...prev, selectedCountry]));
      setQuizzedCountries(prev => new Set([...prev, selectedCountry]));
      const newXp = xp + 50;
      setXp(newXp);
      
      // Update XP in Supabase
      if (user) {
        try {
          await updateUserProfile(user.id, { xp: newXp });
        } catch (error) {
          console.error('Error updating XP:', error);
        }
      }
      
      // Update region progress
      const regionCountries = currentRegion?.countries || [];
      const completed = regionCountries.filter(code => 
        unlockedCountries.has(code) || code === selectedCountry
      ).length;
      
      try {
        await updateRegionProgress(user.id, currentRegion.name, completed, regionCountries.length);
      } catch (error) {
        console.error('Error updating region progress:', error);
      }
      
      // Keep selectedCountry and countryData so info shows
    } else {
      // Quiz failed, mark as quizzed but keep locked
      setQuizzedCountries(prev => new Set([...prev, selectedCountry]));
      setSelectedCountry(null);
      setCountryData(null);
    }
  };

  const unlockNextRegion = () => {
    if (!canUnlockNext) return;

    const nextRegionIndex = regions.findIndex(
      (region) => region.name === currentRegion.nextRegion
    );

    if (nextRegionIndex !== -1) {
      const nextRegion = regions[nextRegionIndex];
      // Add next region's countries to available countries
      setAvailableCountries(prev => [...prev, ...nextRegion.countries]);
      setCurrentRegionIndex(nextRegionIndex);
      setXp(prev => prev + 200); // Bonus XP for unlocking region
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access Quest Mode</h1>
            <p className="text-gray-600">This feature is only available for logged-in users.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  const regionCountries = currentRegion?.countries || [];
  const completedCount = regionCountries.filter(code => unlockedCountries.has(code)).length;
  const totalCount = regionCountries.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quest Mode</h1>
            <p className="text-lg text-gray-600">Complete quizzes to unlock countries and regions!</p>
          </header>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xl font-semibold text-gray-700">
                  XP: <span className="text-indigo-600">{xp}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Current Region: <span className="font-medium">{currentRegion?.name}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Progress: <span className="font-medium">{completedCount}/{totalCount}</span> countries completed ({Math.round(regionProgress)}%)
                </p>
              </div>
              {canUnlockNext && (
                <button
                  onClick={unlockNextRegion}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Unlock {currentRegion.nextRegion}
                </button>
              )}
              {!canUnlockNext && currentRegion?.nextRegion && (
                <div className="px-6 py-3 bg-gray-200 text-gray-600 rounded-lg font-semibold">
                  Complete {Math.round(80 - regionProgress)}% more to unlock {currentRegion.nextRegion}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Region Progress</span>
                <span>{Math.round(regionProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${regionProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-hidden relative">
              <button
                onClick={() => setShowWorldView(!showWorldView)}
                className="absolute top-2 right-2 z-10 px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                {showWorldView ? 'Zoom to Region' : 'Show World View'}
              </button>
              <WorldMap
                unlockedCountries={Array.from(unlockedCountries)}
                availableCountries={availableCountries}
                onCountrySelect={handleCountrySelect}
                regionCenter={showWorldView ? null : currentRegion?.center}
                regionScale={showWorldView ? null : currentRegion?.scale}
                regionCountries={showWorldView ? [] : currentRegion?.countries || []}
              />
            </div>

            {selectedCountry && unlockedCountries.has(selectedCountry) && (
              <CountryInfo isoCode={selectedCountry} />
            )}

            {selectedCountry && !unlockedCountries.has(selectedCountry) && quizzedCountries.has(selectedCountry) && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  <strong>Quiz Failed</strong>
                </p>
                <p className="text-sm text-red-600 mt-2">
                  You didn't pass the quiz for this country. Click on it again to retry!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showQuiz && countryData && (
        <QuizModal
          country={selectedCountry}
          countryData={countryData}
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
};

export default QuestMode;
