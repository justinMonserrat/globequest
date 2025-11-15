import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { getUserProfile, getCountryProgress, getRegionProgress, updateUserProfile } from '../lib/supabaseProgress';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [countryProgress, setCountryProgress] = useState([]);
  const [regionProgress, setRegionProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    avatar_url: '',
    country_from: '',
    favorite_flag: '',
    country_to_visit: '',
    countries_visited: [],
  });
  const [allCountries, setAllCountries] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfileData = async () => {
      try {
        const [profileData, countryData, regionData] = await Promise.all([
          getUserProfile(user.id),
          getCountryProgress(user.id),
          getRegionProgress(user.id),
        ]);

        setProfile(profileData);
        setCountryProgress(countryData || []);
        setRegionProgress(regionData || []);

        // Load countries list for dropdowns
        const countriesResponse = await fetch('https://restcountries.com/v3.1/all?fields=name,cca3');
        const countriesData = await countriesResponse.json();
        setAllCountries(countriesData.sort((a, b) => a.name.common.localeCompare(b.name.common)));

        // Set edit form with profile data
        if (profileData) {
          setEditForm({
            display_name: profileData.display_name || '',
            avatar_url: profileData.avatar_url || '',
            country_from: profileData.country_from || '',
            favorite_flag: profileData.favorite_flag || '',
            country_to_visit: profileData.country_to_visit || '',
            countries_visited: profileData.countries_visited || [],
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Ensure countries_visited is properly formatted as array
      const updates = {
        ...editForm,
        countries_visited: Array.isArray(editForm.countries_visited) 
          ? editForm.countries_visited 
          : [],
      };
      
      const updated = await updateUserProfile(user.id, updates);
      if (updated) {
        setProfile(updated);
        setEditing(false);
        // Reload profile data to get fresh data
        const profileData = await getUserProfile(user.id);
        setProfile(profileData);
      } else {
        alert('Failed to save profile. Please check the console for errors.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Failed to save profile: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Store as base64 data URL
        setEditForm({ ...editForm, avatar_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVisitedCountry = (countryCode) => {
    if (!editForm.countries_visited.includes(countryCode)) {
      setEditForm({
        ...editForm,
        countries_visited: [...editForm.countries_visited, countryCode],
      });
    }
  };

  const handleRemoveVisitedCountry = (countryCode) => {
    setEditForm({
      ...editForm,
      countries_visited: editForm.countries_visited.filter(c => c !== countryCode),
    });
  };

  const calculateLevel = (xp) => {
    return Math.floor(xp / 500) + 1;
  };

  const xpForNextLevel = (xp) => {
    const currentLevel = calculateLevel(xp);
    return (currentLevel * 500) - xp;
  };

  const unlockedCount = countryProgress.filter(c => c.quiz_passed).length;
  const totalQuizzes = countryProgress.length;
  const regionsCompleted = regionProgress.filter(r => r.completion_percentage >= 80).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const level = calculateLevel(profile?.xp || 0);
  const xpNeeded = xpForNextLevel(profile?.xp || 0);
  const xpProgress = ((profile?.xp || 0) % 500) / 500 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header with Customization */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-indigo-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-200 flex items-center justify-center text-3xl">
                  {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  {profile?.display_name || user.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-gray-600">{profile?.email || user.email}</p>
                <div className="text-2xl font-bold text-indigo-600 mt-2">Level {level}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {editing && (
                <button
                  onClick={() => {
                    setEditing(false);
                    // Reset form to original profile data
                    if (profile) {
                      setEditForm({
                        display_name: profile.display_name || '',
                        avatar_url: profile.avatar_url || '',
                        country_from: profile.country_from || '',
                        favorite_flag: profile.favorite_flag || '',
                        country_to_visit: profile.country_to_visit || '',
                        countries_visited: profile.countries_visited || [],
                      });
                    }
                  }}
                  disabled={saving}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {editing ? (saving ? 'Saving...' : 'Save') : 'Edit Profile'}
              </button>
            </div>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <div className="flex items-center gap-4">
                  {editForm.avatar_url && (
                    <img
                      src={editForm.avatar_url}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Max 5MB. JPG, PNG, or GIF</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country You're From</label>
                <div className="flex items-center gap-3">
                  {editForm.country_from && (
                    <img
                      src={`https://flagcdn.com/w40/${editForm.country_from.toLowerCase()}.png`}
                      alt="Flag"
                      className="w-10 h-7 object-cover border border-gray-300 rounded"
                      onError={(e) => {
                        e.target.src = `https://flagcdn.com/w40/${editForm.country_from.toLowerCase()}.svg`;
                      }}
                    />
                  )}
                  <select
                    value={editForm.country_from}
                    onChange={(e) => setEditForm({ ...editForm, country_from: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select country...</option>
                    {allCountries.map((country) => (
                      <option key={country.cca3} value={country.cca3}>
                        {country.name.common}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Flag</label>
                <div className="flex items-center gap-3">
                  {editForm.favorite_flag && (
                    <img
                      src={`https://flagcdn.com/w40/${editForm.favorite_flag.toLowerCase()}.png`}
                      alt="Flag"
                      className="w-10 h-7 object-cover border border-gray-300 rounded"
                      onError={(e) => {
                        e.target.src = `https://flagcdn.com/w40/${editForm.favorite_flag.toLowerCase()}.svg`;
                      }}
                    />
                  )}
                  <select
                    value={editForm.favorite_flag}
                    onChange={(e) => setEditForm({ ...editForm, favorite_flag: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select country...</option>
                    {allCountries.map((country) => (
                      <option key={country.cca3} value={country.cca3}>
                        {country.name.common}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country You Want to Visit Most</label>
                <div className="flex items-center gap-3">
                  {editForm.country_to_visit && (
                    <img
                      src={`https://flagcdn.com/w40/${editForm.country_to_visit.toLowerCase()}.png`}
                      alt="Flag"
                      className="w-10 h-7 object-cover border border-gray-300 rounded"
                      onError={(e) => {
                        e.target.src = `https://flagcdn.com/w40/${editForm.country_to_visit.toLowerCase()}.svg`;
                      }}
                    />
                  )}
                  <select
                    value={editForm.country_to_visit}
                    onChange={(e) => setEditForm({ ...editForm, country_to_visit: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select country...</option>
                    {allCountries.map((country) => (
                      <option key={country.cca3} value={country.cca3}>
                        {country.name.common}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Country Visited</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddVisitedCountry(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select to add...</option>
                  {allCountries
                    .filter(c => !editForm.countries_visited.includes(c.cca3))
                    .map((country) => (
                      <option key={country.cca3} value={country.cca3}>
                        {country.name.common}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {profile?.country_from && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-gray-500 mb-2">From</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://flagcdn.com/w40/${profile.country_from.toLowerCase()}.png`}
                      alt="Flag"
                      className="w-10 h-7 object-cover border border-gray-300 rounded"
                      onError={(e) => {
                        e.target.src = `https://flagcdn.com/w40/${profile.country_from.toLowerCase()}.svg`;
                      }}
                    />
                    <p className="font-semibold text-gray-800">
                      {allCountries.find(c => c.cca3 === profile.country_from)?.name.common || profile.country_from}
                    </p>
                  </div>
                </div>
              )}
              {profile?.favorite_flag && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-xs text-gray-500 mb-2">Favorite Flag</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://flagcdn.com/w40/${profile.favorite_flag.toLowerCase()}.png`}
                      alt="Flag"
                      className="w-10 h-7 object-cover border border-gray-300 rounded"
                      onError={(e) => {
                        e.target.src = `https://flagcdn.com/w40/${profile.favorite_flag.toLowerCase()}.svg`;
                      }}
                    />
                    <p className="font-semibold text-gray-800">
                      {allCountries.find(c => c.cca3 === profile.favorite_flag)?.name.common || profile.favorite_flag}
                    </p>
                  </div>
                </div>
              )}
              {profile?.country_to_visit && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-gray-500 mb-2">Wants to Visit</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://flagcdn.com/w40/${profile.country_to_visit.toLowerCase()}.png`}
                      alt="Flag"
                      className="w-10 h-7 object-cover border border-gray-300 rounded"
                      onError={(e) => {
                        e.target.src = `https://flagcdn.com/w40/${profile.country_to_visit.toLowerCase()}.svg`;
                      }}
                    />
                    <p className="font-semibold text-gray-800">
                      {allCountries.find(c => c.cca3 === profile.country_to_visit)?.name.common || profile.country_to_visit}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {(profile?.countries_visited && profile.countries_visited.length > 0) || (editing && editForm.countries_visited.length > 0) ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Countries Visited ({(editing ? editForm.countries_visited : profile.countries_visited)?.length || 0})
              </p>
              <div className="flex flex-wrap gap-2">
                {(editing ? editForm.countries_visited : profile.countries_visited)?.map((code) => {
                  const country = allCountries.find(c => c.cca3 === code);
                  return (
                    <div
                      key={code}
                      className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      <img
                        src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
                        alt="Flag"
                        className="w-5 h-4 object-cover rounded"
                        onError={(e) => {
                          e.target.src = `https://flagcdn.com/w20/${code.toLowerCase()}.svg`;
                        }}
                      />
                      <span>{country?.name.common || code}</span>
                      {editing && (
                        <button
                          onClick={() => handleRemoveVisitedCountry(code)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800 font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* XP Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress to Level {level + 1}</span>
              <span>{xpNeeded} XP needed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="text-2xl font-bold text-indigo-600">{unlockedCount}</div>
              <div className="text-sm text-gray-600">Countries Unlocked</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{regionsCompleted}</div>
              <div className="text-sm text-gray-600">Regions Completed</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{totalQuizzes}</div>
              <div className="text-sm text-gray-600">Total Quizzes Taken</div>
            </div>
          </div>
        </div>

        {/* Region Progress */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Region Progress</h2>
          <div className="space-y-4">
            {regionProgress.length === 0 ? (
              <p className="text-gray-500">No region progress yet. Start exploring!</p>
            ) : (
              regionProgress.map((region) => (
                <div key={region.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">{region.region_name}</h3>
                    <span className="text-sm font-bold text-indigo-600">
                      {Math.round(region.completion_percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        region.completion_percentage >= 80
                          ? 'bg-green-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(region.completion_percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {region.countries_completed} / {region.countries_total} countries
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {countryProgress
              .filter(c => c.quiz_passed)
              .sort((a, b) => new Date(b.unlocked_at) - new Date(a.unlocked_at))
              .slice(0, 10)
              .map((country) => (
                <div
                  key={country.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-semibold text-gray-800">{country.country_code}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {country.region_name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {country.quiz_score}/{country.quiz_total} correct
                  </div>
                </div>
              ))}
            {countryProgress.filter(c => c.quiz_passed).length === 0 && (
              <p className="text-gray-500">No activity yet. Start your quest!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
