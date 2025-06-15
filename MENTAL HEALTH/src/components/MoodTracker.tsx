import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

const moods = [
  { emoji: '😊', label: 'Great', value: 'great', color: 'bg-green-500' },
  { emoji: '🙂', label: 'Good', value: 'good', color: 'bg-blue-500' },
  { emoji: '😐', label: 'Okay', value: 'okay', color: 'bg-yellow-500' },
  { emoji: '😔', label: 'Low', value: 'low', color: 'bg-orange-500' },
  { emoji: '😢', label: 'Sad', value: 'sad', color: 'bg-red-500' },
];

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userProfile = useQuery(api.mentalHealth.getUserProfile);
  const recordMood = useMutation(api.mentalHealth.recordMood);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordMood({
        mood: selectedMood,
        notes: notes.trim() || undefined,
      });
      toast.success('Mood recorded successfully!');
      setSelectedMood('');
      setNotes('');
    } catch (error) {
      toast.error('Failed to record mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodHistory = userProfile?.mentalHealthData?.moodHistory || [];
  const recentMoods = moodHistory.slice(-7).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          How are you feeling today?
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Track your daily mood to better understand your emotional patterns.
        </p>
      </div>

      {/* Current Mood */}
      {userProfile?.mentalHealthData?.currentMood && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {moods.find(m => m.value === userProfile.mentalHealthData.currentMood)?.emoji || '😐'}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Current mood: {userProfile.mentalHealthData.currentMood}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Last updated today
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mood Selection */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Select your current mood:
          </label>
          <div className="grid grid-cols-5 gap-3">
            {moods.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMood === mood.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-3xl mb-2">{mood.emoji}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mood.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="What's contributing to your mood today?"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedMood || isSubmitting}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? 'Recording...' : 'Record Mood'}
        </button>
      </form>

      {/* Mood History */}
      {recentMoods.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Mood History
          </h3>
          <div className="space-y-3">
            {recentMoods.map((entry, index) => {
              const mood = moods.find(m => m.value === entry.mood);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">{mood?.emoji || '😐'}</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {mood?.label || entry.mood}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
