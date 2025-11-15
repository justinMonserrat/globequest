import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const QuestSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Placeholder data for logged-in users
  const userStats = {
    xp: 1250,
    dailyStreak: 7,
    lastRegion: 'Caribbean',
    level: 5,
  };

  if (!user) {
    return (
      <aside className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Start your Exploration Quest!</h3>
          <p className="text-gray-600 text-sm mb-4">
            Quest Mode unlocks regions, XP, progression, and more. Track your journey around the world!
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Log In / Sign Up to Begin
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-4">
        {/* User Card */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">
              {user.email?.split('@')[0] || 'Explorer'}
            </h3>
            <p className="text-sm text-gray-600">Level {userStats.level}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">XP</span>
            <span className="font-semibold text-indigo-600">{userStats.xp.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Daily Streak</span>
            <span className="font-semibold text-gray-800">
              🔥 {userStats.dailyStreak} days
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Last Region</span>
            <span className="font-semibold text-gray-800">{userStats.lastRegion}</span>
          </div>
        </div>

        {/* Continue Quest Button */}
        <button
          onClick={() => navigate('/quest')}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-semibold mt-4"
        >
          Continue Your World Quest
        </button>
      </div>
    </aside>
  );
};

export default QuestSidebar;

