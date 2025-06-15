import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ChatInterface } from './ChatInterface';
import { MoodTracker } from './MoodTracker';
import { VoiceRecorder } from './VoiceRecorder';
import { UserProfile } from './UserProfile';
import { 
  ChatBubbleLeftRightIcon, 
  HeartIcon, 
  MicrophoneIcon, 
  UserCircleIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

type TabType = 'chat' | 'mood' | 'voice' | 'profile' | 'analytics';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const userProfile = useQuery(api.mentalHealth.getUserProfile);
  const conversations = useQuery(api.mentalHealth.getConversations, { limit: 5 });

  const tabs = [
    { id: 'chat', label: 'Chat Support', icon: ChatBubbleLeftRightIcon },
    { id: 'mood', label: 'Mood Tracker', icon: HeartIcon },
    { id: 'voice', label: 'Voice Analysis', icon: MicrophoneIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface />;
      case 'mood':
        return <MoodTracker />;
      case 'voice':
        return <VoiceRecorder />;
      case 'profile':
        return <UserProfile />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Your Mental Wellness Space
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          How are you feeling today? I'm here to listen and support you.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Mood</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {userProfile?.mentalHealthData?.currentMood || 'Not set'}
              </p>
            </div>
            <HeartIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conversations</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {conversations?.length || 0}
              </p>
            </div>
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Days Active</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {userProfile?.mentalHealthData?.moodHistory?.length || 0}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

function AnalyticsDashboard() {
  const userProfile = useQuery(api.mentalHealth.getUserProfile);
  const moodHistory = userProfile?.mentalHealthData?.moodHistory || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Mental Health Analytics</h2>
      
      {/* Mood Trends */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mood Trends</h3>
        {moodHistory.length > 0 ? (
          <div className="space-y-3">
            {moodHistory.slice(-7).map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {entry.mood}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Start tracking your mood to see trends here.</p>
        )}
      </div>

      {/* Goals Progress */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Goals</h3>
        {userProfile?.mentalHealthData?.goals?.length ? (
          <div className="space-y-2">
            {userProfile.mentalHealthData.goals.map((goal, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">{goal}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Set some goals in your profile to track progress.</p>
        )}
      </div>
    </div>
  );
}
