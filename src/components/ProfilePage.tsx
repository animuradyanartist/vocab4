import React, { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  Settings,
  Info,
  Bell,
  BellOff,
  Clock,
  ChevronRight,
  ChevronDown,
  Award,
  Palette
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { dailyPushNotification } from '../utils/dailyPushNotification';
import { useBadges } from '../hooks/useBadges';
import DarkModeToggle from './DarkModeToggle';

// ⭐ Language selector + types
import LanguageSelect, { languageLabel, type SupportedLanguageCode } from './LanguageSelect';

// ✅ FIXED: use the client you actually have
import { supabase } from '../config/supabase';

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

  // ⭐ state for learning language
  const [language, setLanguage] = useState<SupportedLanguageCode>('hy');
  const [loadingLang, setLoadingLang] = useState(true);

  const username = user?.email?.split('@')[0] || 'User';
  const totalWords = words.length;
  const learnedWords = words.filter((word) => word.isLearned).length;

  // badges
  const earnedBadges = badges.filter((badge) => badge.earnedAt);
  const categories = ['all', 'practice', 'vocabulary', 'streak', 'achievement', 'special'] as const;
  const filteredBadges =
    selectedCategory === 'all'
      ? allBadges
      : allBadges.filter((badge) => badge.category === selectedCategory);

  const getRarityName = (rarity: string) => rarity.charAt(0).toUpperCase() + rarity.slice(1);

  useEffect(() => {
    // notifications check
    dailyPushNotification.checkAndNotify();
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // ⭐ load language from Supabase profile
  useEffect(() => {
    async function loadLanguage() {
      if (!user) {
        setLoadingLang(false);
        return;
      }
      const { data } = await supabase
        .from('user_profiles')
        .select('native_language_code')
        .eq('id', user.uid) // your PK = auth uid
        .single();

      if (data?.native_language_code) {
        setLanguage(data.native_language_code as SupportedLanguageCode);
      }
      setLoadingLang(false);
    }
    loadLanguage();
  }, [user]);

  // ⭐ update handler to save to Supabase
  async function handleLanguageChange(newLang: SupportedLanguageCode) {
    if (!user) return;
    await supabase.from('user_profiles').update({ native_language_code: newLang }).eq('id', user.uid);
    setLanguage(newLang);
  }

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
                <span className="text-sm text-gray-600">
                  {totalWords} words • {learnedWords} learned
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section ... (unchanged in your repo) */}

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

          {showSettings && (
            <div className="bg-gray-50/50 border-b border-gray-100">
              <div className="p-6 space-y-6">
                {/* ⭐ Learning Language */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Learning Language</h3>
                  {loadingLang ? (
                    <p>Loading language...</p>
                  ) : (
                    <LanguageSelect
                      value={language}
                      onChange={handleLanguageChange}
                      label="Select your learning language"
                    />
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    Current: <strong>{languageLabel(language)}</strong>
                  </p>
                </div>

                {/* Daily Practice Reminder Section (unchanged UI) */}
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
                            : 'Click the toggle above to request notification permission.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
              <span
                className={`font-medium px-2 py-1 rounded-full text-xs ${
                  import.meta.env.VITE_APP_ENV === 'staging'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
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
