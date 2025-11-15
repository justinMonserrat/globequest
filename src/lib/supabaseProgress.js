// Supabase functions for managing user progress
import { supabase } from './supabaseClient';

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    // Ensure countries_visited is properly formatted as an array
    const cleanUpdates = {
      ...updates,
      countries_visited: Array.isArray(updates.countries_visited) 
        ? updates.countries_visited 
        : (updates.countries_visited ? [updates.countries_visited] : []),
      updated_at: new Date().toISOString(),
    };

    // Convert empty strings to null for optional fields
    const fieldsToClean = ['display_name', 'avatar_url', 'country_from', 'favorite_flag', 'country_to_visit'];
    fieldsToClean.forEach(field => {
      if (cleanUpdates[field] === '') {
        cleanUpdates[field] = null;
      }
    });

    // Remove undefined values to avoid issues
    Object.keys(cleanUpdates).forEach(key => {
      if (cleanUpdates[key] === undefined) {
        delete cleanUpdates[key];
      }
    });

    // Try to update first
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update(cleanUpdates)
      .eq('id', userId)
      .select();

    // If update succeeded and returned data
    if (updateData && updateData.length > 0) {
      return updateData[0];
    }

    // If update failed or returned no rows, try to insert
    if (updateError || !updateData || updateData.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...cleanUpdates,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        console.error('Update data:', cleanUpdates);
        throw insertError;
      }

      return insertData;
    }

    // Should not reach here, but just in case
    throw new Error('Failed to update or create profile');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error; // Re-throw so caller can handle it
  }
};

// Get country progress for a user
export const getCountryProgress = async (userId, countryCode = null) => {
  try {
    let query = supabase
      .from('country_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (countryCode) {
      query = query.eq('country_code', countryCode).single();
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return countryCode ? data : data || [];
  } catch (error) {
    console.error('Error fetching country progress:', error);
    return countryCode ? null : [];
  }
};

// Save or update country progress
export const saveCountryProgress = async (userId, countryCode, regionName, quizData) => {
  try {
    const { data, error } = await supabase
      .from('country_progress')
      .upsert({
        user_id: userId,
        country_code: countryCode,
        region_name: regionName,
        quiz_passed: quizData.passed,
        quiz_score: quizData.score,
        quiz_total: quizData.total,
        times_quizzed: quizData.timesQuizzed || 1,
        unlocked_at: quizData.passed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,country_code'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving country progress:', error);
    return null;
  }
};

// Get region progress for a user
export const getRegionProgress = async (userId, regionName = null) => {
  try {
    let query = supabase
      .from('region_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (regionName) {
      query = query.eq('region_name', regionName).single();
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return regionName ? data : data || [];
  } catch (error) {
    console.error('Error fetching region progress:', error);
    return regionName ? null : [];
  }
};

// Update region progress
export const updateRegionProgress = async (userId, regionName, countriesCompleted, countriesTotal) => {
  try {
    const completionPercentage = (countriesCompleted / countriesTotal) * 100;
    
    const { data, error } = await supabase
      .from('region_progress')
      .upsert({
        user_id: userId,
        region_name: regionName,
        countries_completed: countriesCompleted,
        countries_total: countriesTotal,
        completion_percentage: completionPercentage,
        unlocked_at: completionPercentage >= 80 ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,region_name'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating region progress:', error);
    return null;
  }
};

// Get all progress for a user (for syncing)
export const getAllUserProgress = async (userId) => {
  try {
    const [countryProgress, regionProgress, profile] = await Promise.all([
      getCountryProgress(userId),
      getRegionProgress(userId),
      getUserProfile(userId),
    ]);
    
    return {
      profile,
      countryProgress,
      regionProgress,
    };
  } catch (error) {
    console.error('Error fetching all user progress:', error);
    return {
      profile: null,
      countryProgress: [],
      regionProgress: [],
    };
  }
};

