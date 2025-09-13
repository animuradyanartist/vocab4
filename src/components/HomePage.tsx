import React, { useState, useCallback, useMemo } from 'react';
import { Plus, BookOpen, Eye, EyeOff, Volume2, ArrowRight } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import AddWordModal from './AddWordModal';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

interface HomePageProps {
  onWordSelect: (word: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onWordSelect }) => {
  const { user } = useAuth();
  const { words, loading, addWords } = useFirestore();
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [badges] = useState<Badge[]>([
    {
      id: '1',
      name: 'First Steps',
      description: 'Added your first word',
      icon: '🎯',
      earnedAt: new Date('2024-01-15')
    }
  ]);

  const username = user?.email?.split('@')[0] || 'User';

  // Get statistics
  const { totalWords, learnedWords, learningWords, recentWords } = useMemo(() => {
    const total = words.length;
    const learned = words.filter(word => word.isLearned).length;
    const learning = total - learned;
    
    // Get recent 5 words (not learned)
    const recent = words
      .filter(word => !word.isLearned)
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 5);
    
    return {
      totalWords: total,
      learnedWords: learned,
      learningWords: learning,
      recentWords: recent
    };
  }, [words]);
  
  const handleAddNewWord = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleSaveWord = useCallback(async (newWord: { english: string; armenian: string }) => {
    await addWords([newWord]);
  }, [addWords]);

  const playPronunciation = useCallback((word: string) => {
    if (!word.trim()) return;
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, []);
  
  const toggleWordReveal = useCallback((wordId: string) => {
    setRevealedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  }, []);

  // Show loading only on initial load, not when words are cached
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Vocabulary Learner</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {username}!</p>
            </div>
          </div>
          <button
            onClick={handleAddNewWord}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white p-3 rounded-full shadow-lg hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 transform hover:scale-110 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {totalWords > 0 ? (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">{totalWords}</div>
                  <div className="text-xs md:text-sm text-blue-700">Total Words</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-orange-600">{learningWords}</div>
                  <div className="text-xs md:text-sm text-orange-700">Learning</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-green-600">{learnedWords}</div>
                  <div className="text-xs md:text-sm text-green-700">Learned</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-purple-600">{badges.length}</div>
                  <div className="text-xs md:text-sm text-purple-700">Badges</div>
                </div>
              </div>
            </div>

            {/* Recent Words */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Words</h2>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1">
                  <span>Show All</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {recentWords.length > 0 ? (
                <div className="space-y-3">
                  {recentWords.map((word) => (
                    <div
                      key={word.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer group"
                      onClick={() => onWordSelect(word)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">{word.english}</h3>
                          <button
                            onClick={(e) => { e.stopPropagation(); playPronunciation(word.english); }}
                            className="p-1 rounded-full hover:bg-indigo-100 transition-colors duration-200"
                            title="Play pronunciation"
                          >
                            <Volume2 className="w-3 h-3 text-indigo-500" />
                          </button>
                        </div>
                        {revealedWords.has(word.id) ? (
                          <p className="text-sm text-indigo-600 font-medium">{word.armenian}</p>
                        ) : (
                          <p className="text-xs text-gray-400">Tap to reveal translation</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWordReveal(word.id); }}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                        title={revealedWords.has(word.id) ? 'Hide translation' : 'Show translation'}
                      >
                        {revealedWords.has(word.id) ? (
                          <EyeOff className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                        ) : (
                          <Eye className="w-3 h-3 md:w-4 md:h-4 text-indigo-500" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No words to practice yet</p>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Words Yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't added any words yet. Start building your Armenian vocabulary by adding your first word!
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Add Word Modal */}
      <AddWordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveWord}
      />
    </div>
  );
};

export default HomePage;