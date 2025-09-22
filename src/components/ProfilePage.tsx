import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, Info, Bell, BellOff, Clock, ChevronRight, ChevronDown, Award, Palette } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { dailyPushNotification } from '../utils/dailyPushNotification';
import { useBadges } from '../hooks/useBadges';
import DarkModeToggle from './DarkModeToggle';

// ⭐ ADDED imports
import LanguageSelect, { languageLabel, type SupportedLanguageCode } from "./LanguageSelect";
import { supabase } from "../lib/supabaseClient";

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

  // ⭐ ADDED state for language
  const [language, setLanguage] = useState<SupportedLanguageCode>("hy");
  const [loadingLang, setLoadingLang] = useState(true);

  const username = user?.email?.split('@')[0] || 'User';
  const totalWords = words.length;
  const learnedWords = words.filter(word => word.isLearned).length;
  
  const earnedBadges = badges.filter(badge => badge.earnedAt);
  const categories = ['all', 'practice', 'vocabulary', 'streak', 'achievement', 'special'];
  const filteredBadges = selectedCategory === 'all' 
    ? allBadges 
    : allBadges.filter(badge => badge.category === selectedCategory);

  const getRarityName = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  useEffect(() => {
    dailyPushNotification.checkAndNotify();
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // ⭐ ADDED: load language from Supabase
  useEffect(() => {
    async function loadLanguage() {
      if (!user) {
        setLoadingLang(false);
        return;
      }
      const { data } = await supabase
        .from("user_profiles")
        .select("native_language_code")
        .eq("id", user.uid) // use .id or .uid depending on your schema
        .single();
      if (data?.native_language_code) {
        setLanguage(data.native_language_code as SupportedLanguageCode);
      }
      setLoadingLang(false);
    }
    loadLanguage();
  }, [user]);

  // ⭐ ADDED: update handler
  async function handleLanguageChange(newLang: SupportedLanguageCode) {
    if (!user) return;
    await supabase
      .from("user_profiles")
      .update({ native_language_code: newLang })
      .eq("id", user.uid);
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
                <span className="text-sm text-gray-600">{totalWords} words • {learnedWords} learned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section ... (unchanged) */}

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
                {/* ⭐ ADDED: Learning Language section */}
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

                {/* Daily Practice Reminder Section (unchanged) */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Daily Practice Reminder</h3>
                    <p className="text-sm text-gray-600">Stay consistent with daily notifications</p>
                  </div>
                </div>
                {/* ... rest of notification settings unchanged */}
              </div>
            </div>
          )}
          
          {/* Other menu items (About, Sign Out) unchanged */}
        </div>

        {/* App Info Section unchanged */}
      </main>
    </div>
  );
};

export default ProfilePage;
