import { SignInForm } from '../SignInForm';
import { HeartIcon, ShieldCheckIcon, GlobeAltIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

export function LandingPage() {
  const features = [
    {
      icon: HeartIcon,
      title: 'AI-Powered Support',
      description: 'Get personalized mental health support powered by advanced AI that understands your emotional needs.',
    },
    {
      icon: MicrophoneIcon,
      title: 'Voice Analysis',
      description: 'Speak naturally and let our AI analyze your voice patterns to detect emotional cues and provide better support.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Multilingual Support',
      description: 'Communicate in your preferred language with support for multiple languages and cultural contexts.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Privacy & Security',
      description: 'Your conversations are encrypted and secure. We prioritize your privacy and confidentiality.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <HeartIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI-Powered
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mental Health Companion
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Get instant, personalized mental health support through AI-powered conversations. 
            Speak or type in your language, and receive compassionate guidance whenever you need it.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-16">
          <SignInForm />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Mental Health Support That's Always Available
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold mb-2">24/7</div>
            <div className="text-blue-100">Available Support</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">50+</div>
            <div className="text-blue-100">Languages Supported</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">100%</div>
            <div className="text-blue-100">Private & Secure</div>
          </div>
        </div>
      </div>

      {/* Crisis Support Notice */}
      <div className="mt-12 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Crisis Support
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm">
              If you're experiencing a mental health crisis, please contact emergency services or a crisis hotline immediately. 
              This AI assistant is designed for support but is not a replacement for professional mental health care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
