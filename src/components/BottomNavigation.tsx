import React from 'react';
import { Home, BookOpen, User, Brain, FileText, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

interface BottomNavigationProps {
  currentPage: 'home' | 'words' | 'practice' | 'text-practice' | 'ai-assistant' | 'profile' | 'admin';
  onPageChange: (page: 'home' | 'words' | 'practice' | 'text-practice' | 'ai-assistant' | 'profile' | 'admin') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage, onPageChange }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.uid)
        .single();

      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'words' as const, label: 'My Words', icon: BookOpen },
    { id: 'practice' as const, label: 'Practice', icon: Brain },
    { id: 'text-practice' as const, label: 'Text Practice', icon: FileText },
    ...(isAdmin ? [{ id: 'admin' as const, label: 'Admin', icon: Shield }] : []),
    { id: 'profile' as const, label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-white/20 z-40 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto px-1 md:px-2">
        <div className="flex items-center justify-around py-1 md:py-2 min-w-max">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onPageChange(id)}
              className={`flex flex-col items-center py-1.5 md:py-2 px-2 md:px-3 rounded-xl transition-all duration-200 min-w-0 ${
                currentPage === id
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 md:w-5 md:h-5 mb-0.5 md:mb-1 ${currentPage === id ? 'text-indigo-600' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium truncate ${currentPage === id ? 'text-indigo-600' : 'text-gray-500'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;