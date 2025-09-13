import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, Info, Bell, BellOff, Clock, ChevronRight, ChevronDown, Award, Palette } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { dailyPushNotification } from '../utils/dailyPushNotification';
import { useBadges } from '../hooks/useBadges';
import DarkModeToggle from './DarkModeToggle';

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const { words } = useFirestore();
  const { badges, stats, getRarityColor, getRarityBorder, allBadges } = useBadges();
  const [notificationSettings, setNotificationSettings] = useState(dailyPushNotification.getSettings());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const username = user?.email?.split('@')[0] || 'User';
  const totalWords = words.length;
  const learnedWords = words.filter(word => word.isLearned).length;
  
  // Get earned badges
  const earnedBadges = badges.filter(badge => badge.earnedAt);
  
  // Get badges by category
  const categories = ['all', 'practice', 'vocabulary', 'streak', 'achievement', 'special'];
  const filteredBadges = selectedCategory === 'all' 
    ? allBadges 
    : allBadges.filter(badge => badge.category === selectedCategory);

  const getRarityName = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  useEffect(() => {
    // Check for notifications when component mounts
    dailyPushNotification.checkAndNotify();
    
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const success = await dailyPushNotification.enableNotifications();
      
      if (success) {
        const updatedSettings = dailyPushNotification.getSettings();
        setNotificationSettings(updatedSettings);
        setNotificationPermission('granted');
      } else {
        alert('Please enable notifications in your browser settings to use this feature.');
      }
    } else {
      dailyPushNotification.updateSettings({ enabled: false });
      const updatedSettings = dailyPushNotification.getSettings();
      setNotificationSettings(updatedSettings);
    }
  };

  const handleTimeChange = (time: string) => {
    dailyPushNotification.updateSettings({ time });
    const updatedSettings = dailyPushNotification.getSettings();
    setNotificationSettings(updatedSettings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          <p className="text-sm text-gray-600">Manage your account and settings</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{username}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-gray-600">{totalWords} words • {learnedWords} learned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Award className="w-6 h-6 text-yellow-500 mr-2" />
              Badge Collection
            </h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{earnedBadges.length}</div>
              <div className="text-xs text-gray-600">Earned</div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.practiceSessionsCompleted}</div>
                <div className="text-xs text-blue-700">Practice Sessions</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.perfectScores}</div>
                <div className="text-xs text-green-700">Perfect Scores</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.totalWordsLearned}</div>
                <div className="text-xs text-purple-700">Words Learned</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                <div className="text-xs text-orange-700">Current Streak</div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredBadges.map((badge) => {
              const isEarned = earnedBadges.find(b => b.id === badge.id);
              const progress = badge.progress || 0;
              const maxProgress = badge.maxProgress || 1;
              const progressPercent = (progress / maxProgress) * 100;

              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                    isEarned 
                      ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white ${getRarityBorder(badge.rarity)} transform hover:scale-105` 
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  {/* Rarity indicator */}
                  {isEarned && (
                    <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-xs font-medium">{getRarityName(badge.rarity)}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <div className={`text-3xl ${isEarned ? '' : 'grayscale opacity-50'}`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${isEarned ? 'text-white' : 'text-gray-600'}`}>
                        {badge.name}
                      </h3>
                      <p className={`text-sm truncate ${isEarned ? 'text-white/90' : 'text-gray-500'}`}>
                        {badge.description}
                      </p>
                      
                      {/* Progress bar for unearned badges */}
                      {!isEarned && badge.maxProgress && progress > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{progress}/{maxProgress}</span>
                            <span>{Math.round(progressPercent)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Earned date */}
                      {isEarned && (
                        <p className="text-xs text-white/80 mt-1">
                          Earned {isEarned.earnedAt!.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">🏆</div>
              <p className="text-gray-500">No badges in this category yet</p>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50/50 transition-colors duration-200 border-b border-gray-100"
          >
            <Settings className="w-6 h-6 text-gray-500" />
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-800">Settings</h3>
              <p className="text-sm text-gray-600">App preferences and notifications</p>
            </div>
            {showSettings ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {/* Settings Content */}
          {showSettings && (
            <div className="bg-gray-50/50 border-b border-gray-100">
              {/* Daily Practice Reminder Section */}
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Daily Practice Reminder</h3>
                    <p className="text-sm text-gray-600">Stay consistent with daily notifications</p>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-800 mb-1">Push Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Get reminded to practice your vocabulary daily
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleNotifications(!notificationSettings.enabled)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      notificationSettings.enabled
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                        notificationSettings.enabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Time Picker */}
                <div className={`space-y-3 ${!notificationSettings.enabled ? 'opacity-50' : ''}`}>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <h4 className="text-base font-semibold text-gray-800">Reminder Time</h4>
                  </div>
                  <input
                    type="time"
                    value={notificationSettings.time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    disabled={!notificationSettings.enabled}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                   style={{ color: '#111827' }}
                  />
                </div>

                {/* Description */}
                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">How it works</h5>
                      <p className="text-sm text-gray-700">
                        Each day at your chosen time, you'll receive a notification with the message: 
                        <span className="font-medium"> "Time to practice! Tap to translate 3 words."</span>
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Tapping the notification will open a quick practice session with 3 random words from your vocabulary.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permission Status */}
                {notificationPermission !== 'granted' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <BellOff className="w-5 h-5 text-yellow-600" />
                      <div>
                        <h5 className="font-semibold text-yellow-800">Notification Permission Required</h5>
                        <p className="text-sm text-yellow-700 mt-1">
                          {notificationPermission === 'denied' 
                            ? 'Notifications are blocked. Please enable them in your browser settings.'
                            : 'Click the toggle above to request notification permission.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Settings Section */}
            </div>
          )}
          
          <button className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50/50 transition-colors duration-200 border-b border-gray-100">
            <Info className="w-6 h-6 text-gray-500" />
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-800">About</h3>
              <p className="text-sm text-gray-600">App version and information</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-4 p-4 hover:bg-red-50/50 transition-colors duration-200 text-red-600"
          >
            <LogOut className="w-6 h-6" />
            <div className="flex-1 text-left">
              <h3 className="font-medium">Sign Out</h3>
              <p className="text-sm text-red-500">Sign out of your account</p>
            </div>
          </button>
        </div>

        {/* App Info Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">App Information</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Environment</span>
              <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                import.meta.env.VITE_APP_ENV === 'staging' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {import.meta.env.VITE_APP_ENV === 'staging' ? 'STAGING' : 'PRODUCTION'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span>User ID</span>
              <span className="font-medium text-xs">{user?.uid?.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span>PWA Support</span>
              <span className="font-medium text-green-600">✓ Enabled</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;