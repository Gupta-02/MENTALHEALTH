import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { UserCircleIcon, CogIcon } from '@heroicons/react/24/outline';

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'system' as 'light' | 'dark' | 'system',
    voiceEnabled: true,
    notifications: true,
  });
  const [mentalHealthData, setMentalHealthData] = useState({
    goals: [] as string[],
    triggers: [] as string[],
  });
  const [newGoal, setNewGoal] = useState('');
  const [newTrigger, setNewTrigger] = useState('');

  const userProfile = useQuery(api.mentalHealth.getUserProfile);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const updateProfile = useMutation(api.mentalHealth.updateUserProfile);

  useEffect(() => {
    if (userProfile) {
      setPreferences(userProfile.preferences);
      setMentalHealthData(userProfile.mentalHealthData);
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      await updateProfile({
        preferences,
        mentalHealthData,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setMentalHealthData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()],
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setMentalHealthData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  const addTrigger = () => {
    if (newTrigger.trim()) {
      setMentalHealthData(prev => ({
        ...prev,
        triggers: [...prev.triggers, newTrigger.trim()],
      }));
      setNewTrigger('');
    }
  };

  const removeTrigger = (index: number) => {
    setMentalHealthData(prev => ({
      ...prev,
      triggers: prev.triggers.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your preferences and mental health information.
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <CogIcon className="w-4 h-4" />
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserCircleIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {loggedInUser?.name || 'Anonymous User'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {loggedInUser?.email || 'No email provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as any }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="voiceEnabled"
              checked={preferences.voiceEnabled}
              onChange={(e) => setPreferences(prev => ({ ...prev, voiceEnabled: e.target.checked }))}
              disabled={!isEditing}
              className="mr-2"
            />
            <label htmlFor="voiceEnabled" className="text-sm text-gray-700 dark:text-gray-300">
              Enable voice features
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              checked={preferences.notifications}
              onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
              disabled={!isEditing}
              className="mr-2"
            />
            <label htmlFor="notifications" className="text-sm text-gray-700 dark:text-gray-300">
              Enable notifications
            </label>
          </div>
        </div>
      </div>

      {/* Mental Health Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Mental Health Goals
        </h3>
        <div className="space-y-3">
          {mentalHealthData.goals.map((goal, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-900 dark:text-white">{goal}</span>
              {isEditing && (
                <button
                  onClick={() => removeGoal(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a new goal..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={addGoal}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Triggers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Known Triggers
        </h3>
        <div className="space-y-3">
          {mentalHealthData.triggers.map((trigger, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-900 dark:text-white">{trigger}</span>
              {isEditing && (
                <button
                  onClick={() => removeTrigger(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="Add a trigger to be aware of..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={addTrigger}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
