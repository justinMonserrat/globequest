import React from 'react';
import Navbar from '../components/Navbar';
import DailyChallenges from '../components/daily/DailyChallenges';
import QuestSidebar from '../components/auth/QuestSidebar';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">GlobeQuest</h1>
          <p className="text-lg text-gray-600">Explore the world, one challenge at a time!</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area - Daily Challenges */}
          <div className="lg:col-span-2">
            <DailyChallenges />
          </div>

          {/* Aside Area - Quest Sidebar */}
          <div className="lg:col-span-1">
            <QuestSidebar />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Landing;

