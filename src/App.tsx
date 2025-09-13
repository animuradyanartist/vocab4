import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Add error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-orange-100 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">The app encountered an error. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-cyan-600 transition-all duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import BottomNavigation from './components/BottomNavigation';
import InstallPrompt from './components/InstallPrompt';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import { useAuth } from './hooks/useAuth';
import { Word } from './hooks/useFirestore';

// Direct imports - no lazy loading
import HomePage from './components/HomePage';
import MyWordsPage from './components/MyWordsPage';
import PracticePage from './components/PracticePage';
import ProfilePage from './components/ProfilePage';
import AIAssistantPage from './components/AIAssistantPage';
import WordDetailPage from './components/WordDetailPage';
import TextPracticePage from './components/TextPracticePage';
import TextViewPage from './components/TextViewPage';
import AdminPage from './components/AdminPage';
import AuthScreen from './components/AuthScreen';
import ResetPasswordPage from './components/ResetPasswordPage';
import EnvTest from './components/EnvTest';
import SupabaseConnectionTest from './components/SupabaseConnectionTest';

export interface CustomText {
  id: string;
  title: string;
  content: string;
  dateAdded: Date;
}

function App() {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'words' | 'practice' | 'text-practice' | 'ai-assistant' | 'profile' | 'admin'>('home');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedText, setSelectedText] = useState<CustomText | null>(null);

  // Check if this is a password reset page
  const isResetPasswordPage = window.location.pathname === '/reset-password' || 
                              window.location.hash.includes('access_token');
  
  // Check if this is the env test page
  const isEnvTestPage = window.location.pathname === '/env-test' || 
                        window.location.search.includes('env-test');
  
  // Check if this is the supabase test page
  const isSupabaseTestPage = window.location.pathname === '/supabase-test' || 
                             window.location.search.includes('supabase-test');

  // Show reset password page if needed
  if (isResetPasswordPage) {
    return <ResetPasswordPage />;
  }
  
  // Show env test page if needed
  if (isEnvTestPage) {
    return <EnvTest />;
  }
  
  // Show supabase test page if needed
  if (isSupabaseTestPage) {
    return <SupabaseConnectionTest />;
  }

  const handleLogout = async () => {
    await logout();
    setCurrentPage('home');
    setSelectedWord(null);
    setSelectedText(null);
  };

  const handleWordSelect = (word: Word) => {
    setSelectedWord(word);
  };

  const handleBackFromWordDetail = () => {
    setSelectedWord(null);
  };

  const handleTextSelect = (text: CustomText) => {
    setSelectedText(text);
  };

  const handleBackFromTextView = () => {
    setSelectedText(null);
  };

  // Show loading only briefly
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Vocabulary Learner</h2>
          <p className="text-gray-600">Loading application...</p>
          <p className="text-xs text-gray-500 mt-2">Environment: {import.meta.env.VITE_APP_ENV || 'production'}</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Show text view if selected
  if (selectedText) {
    return (
      <div className="relative">
        <TextViewPage 
          text={selectedText} 
          onBack={handleBackFromTextView} 
          isPublicText={(selectedText as any).isPublicText || false}
        />
      </div>
    );
  }

  // Show word detail if selected
  if (selectedWord) {
    return (
      <div className="relative">
        <WordDetailPage word={selectedWord} onBack={handleBackFromWordDetail} />
      </div>
    );
  }

  // Show main app
  return (
    <div className="relative">
      {currentPage === 'home' && <HomePage onWordSelect={handleWordSelect} />}
      {currentPage === 'words' && <MyWordsPage onWordSelect={handleWordSelect} />}
      {currentPage === 'practice' && <PracticePage />}
      {currentPage === 'text-practice' && <TextPracticePage onTextSelect={handleTextSelect} />}
      {currentPage === 'ai-assistant' && <AIAssistantPage />}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'profile' && <ProfilePage onLogout={handleLogout} />}
      
      <BottomNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <InstallPrompt />
      <PWAUpdateNotification />
    </div>
  );
}

// Wrap App with ErrorBoundary
function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;