import React from 'react';
import DailyCountryOutline from './DailyCountryOutline';
import DailyFlagGuess from './DailyFlagGuess';

const DailyChallenges = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Challenges</h2>
        <p className="text-gray-600">Test your geography knowledge! No account required.</p>
      </div>
      
      <div className="space-y-6">
        <DailyCountryOutline />
        <DailyFlagGuess />
      </div>
    </div>
  );
};

export default DailyChallenges;

