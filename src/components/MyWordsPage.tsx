import React, { useState, useMemo, useCallback, memo } from 'react';
import { Search, Eye, EyeOff, Plus, Volume2, Check, RotateCcw, BookOpen, CheckCircle, Trash2, Edit3 } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useBadges } from '../hooks/useBadges';
import AddVocabularyModal from './AddVocabularyModal';
import AddWordModal from './AddWordModal';
import EditWordModal from './EditWordModal';

interface Word {
  id: string;
  english: string;
  armenian: string;
  dateAdded: Date;
  isLearned?: boolean;
}

// Memoized word item component
const WordItem = memo<{
  word: Word;
  isRevealed: boolean;
  activeTab: 'learning' | 'learned';
  onWordSelect: (word: Word) => void;
  onPlayPronunciation: (text: string) => void;
  onMarkAsLearned: (id: string) => void;
  onMoveBackToLearning: (id: string) => void;
  onEditWord: (word: Word) => void;
  onDeleteWord: (id: string) => void;
  onToggleReveal: (id: string) => void;
}>(({ 
  word, 
  isRevealed, 
  activeTab, 
  onWordSelect, 
  onPlayPronunciation, 
  onMarkAsLearned, 
  onMoveBackToLearning, 
  onEditWord, 
  onDeleteWord, 
  onToggleReveal 
}) => {
  return (
    <div
      className="flex items-center justify-between p-3 md:p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors duration-200 group cursor-pointer"
      onClick={() => onWordSelect(word)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
            {word.english}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); onPlayPronunciation(word.english); }}
            className="p-1 md:p-1.5 rounded-full hover:bg-indigo-100 transition-colors duration-200 flex-shrink-0"
            title="Play pronunciation"
          >
            <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-indigo-500 hover:text-indigo-600" />
          </button>
        </div>
        {isRevealed ? (
          <p className="text-sm md:text-base text-indigo-600 font-medium mt-1">{word.armenian}</p>
        ) : (
          <p className="text-gray-400 text-xs md:text-sm mt-1">Tap to reveal translation</p>
        )}
      </div>
      <button
        onClick={(e) => { 
          e.stopPropagation(); 
          activeTab === 'learning' ? onMarkAsLearned(word.id) : onMoveBackToLearning(word.id);
        }}
        className={`ml-2 p-2 rounded-full transition-colors duration-200 flex-shrink-0 ${
          activeTab === 'learning' 
            ? 'hover:bg-green-100 text-green-600 hover:text-green-700' 
            : 'hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700'
        }`}
        title={activeTab === 'learning' ? 'Mark as Learned' : 'Move back to My Words'}
      >
        {activeTab === 'learning' ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onEditWord(word); }}
        className="ml-1 md:ml-2 p-1.5 md:p-2 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors duration-200 flex-shrink-0"
        title="Edit Word"
      >
        <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDeleteWord(word.id); }}
        className="ml-1 md:ml-2 p-1.5 md:p-2 rounded-full hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors duration-200 flex-shrink-0"
        title="Delete Word"
      >
        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
      </button>
      <button
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleReveal(word.id); 
        }}
        className="ml-1 md:ml-2 p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
      >
        {isRevealed ? (
          <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        ) : (
          <Eye className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
        )}
      </button>
    </div>
  );
});

WordItem.displayName = 'WordItem';

interface MyWordsPageProps {
  onWordSelect: (word: Word) => void;
}

const MyWordsPage: React.FC<MyWordsPageProps> = ({ onWordSelect }) => {
  const { words, loading, addWords, updateWord, deleteWord } = useFirestore();
  const { addWord, learnWord } = useBadges();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [isAddVocabularyModalOpen, setIsAddVocabularyModalOpen] = useState(false);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [activeTab, setActiveTab] = useState<'learning' | 'learned'>('learning');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAllTranslations, setShowAllTranslations] = useState(false);

  // Separate words into learning and learned
  const learningWords = useMemo(() => {
    return words.filter(word => !word.isLearned);
  }, [words]);

  const learnedWords = useMemo(() => {
    return words.filter(word => word.isLearned);
  }, [words]);

  // Filter and sort words based on active tab
  const filteredWords = useMemo(() => {
    const currentWords = activeTab === 'learning' ? learningWords : learnedWords;
    return currentWords
      .filter(word => 
        word.english.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  }, [learningWords, learnedWords, activeTab, searchTerm]);

  // Show toast message
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Mark word as learned
  const markAsLearned = useCallback(async (wordId: string) => {
    await updateWord(wordId, { isLearned: true });
    learnWord(); // Award badge progress
    showToast('Marked as Learned ✅');
  }, [updateWord, learnWord, showToast]);

  // Move word back to learning
  const moveBackToLearning = useCallback(async (wordId: string) => {
    await updateWord(wordId, { isLearned: false });
    showToast('Moved back to My Words 📘');
  }, [updateWord, showToast]);

  // Delete word
  const handleDeleteWord = useCallback(async (wordId: string) => {
    await deleteWord(wordId);
    showToast('Word deleted 🗑️');
  }, [deleteWord, showToast]);

  // Edit word
  const handleEditWord = useCallback((word: Word) => {
    setEditingWord(word);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback((updatedWord: { english: string; armenian: string }) => {
    if (!editingWord) return;
    
    updateWord(editingWord.id, {
      english: updatedWord.english,
      armenian: updatedWord.armenian
    });
    showToast('Word updated ✏️');
    setEditingWord(null);
  }, [editingWord, updateWord, showToast]);

  // Toggle all translations
  const toggleAllTranslations = useCallback(() => {
    if (showAllTranslations) {
      setRevealedWords(new Set());
    } else {
      const allWordIds = new Set(filteredWords.map(word => word.id));
      setRevealedWords(allWordIds);
    }
    setShowAllTranslations(!showAllTranslations);
  }, [showAllTranslations, filteredWords]);

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

  const playPronunciation = useCallback((word: string) => {
    if (!word.trim()) return;
    
    // Use Web Speech API for pronunciation
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  const handleAddVocabulary = useCallback(async (newWords: { english: string; armenian: string }[]) => {
    await addWords(newWords);
    // Award badge progress for each word added
    newWords.forEach(() => addWord());
  }, [addWords, addWord]);

  const handleAddWord = useCallback(async (newWord: { english: string; armenian: string }) => {
    await addWords([newWord]);
    addWord(); // Award badge progress
    showToast('Word added! ✅');
  }, [addWords, addWord, showToast]);

  // Show loading only on initial load, not when words are cached
  if (loading && words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Vocabulary</h1>
            <p className="text-xs md:text-sm text-gray-600">
              {learningWords.length} learning • {learnedWords.length} learned
            </p>
          </div>
          <button
            onClick={() => setIsAddWordModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white p-2 md:p-3 rounded-full shadow-lg hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 transform hover:scale-110 transition-all duration-200"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('learning')}
              className={`flex-1 flex items-center justify-center space-x-1 md:space-x-2 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'learning'
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">📘 My Words ({learningWords.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('learned')}
              className={`flex-1 flex items-center justify-center space-x-1 md:space-x-2 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'learned'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">✅ Learned Words ({learnedWords.length})</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
            placeholder={`Search ${activeTab === 'learning' ? 'learning' : 'learned'} words...`}
            style={{ color: '#111827' }}
          />
        </div>

        {/* Words List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-3 md:p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">
                {activeTab === 'learning' ? '📘 My Words' : '✅ Learned Words'} ({filteredWords.length})
              </h2>
              <button
                onClick={toggleAllTranslations}
                className="px-2 md:px-3 py-1 md:py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200 text-xs md:text-sm"
              >
                {showAllTranslations ? 'Hide All' : 'Show All'}
              </button>
            </div>
          </div>
          
          {filteredWords.length > 0 ? (
            <div className="max-h-80 md:max-h-96 overflow-y-auto">
              {filteredWords.map((word) => (
                <WordItem
                  key={word.id}
                  word={word}
                  isRevealed={revealedWords.has(word.id)}
                  activeTab={activeTab}
                  onWordSelect={onWordSelect}
                  onPlayPronunciation={playPronunciation}
                  onMarkAsLearned={markAsLearned}
                  onMoveBackToLearning={moveBackToLearning}
                  onEditWord={handleEditWord}
                  onDeleteWord={handleDeleteWord}
                  onToggleReveal={toggleWordReveal}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 md:p-8 text-center">
              <p className="text-sm md:text-base text-gray-500">
                {searchTerm 
                  ? 'No words found matching your search.' 
                  : activeTab === 'learning' 
                    ? 'No words in learning list yet.' : 'No learned words yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Add Vocabulary Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Add Vocabulary</h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Choose from curated word lists based on your level and interests
            </p>
            <button
              onClick={() => setIsAddVocabularyModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 text-sm md:text-base"
            >
              Browse Word Lists
            </button>
          </div>
        </div>
      </main>

      {/* Add Vocabulary Modal */}
      <AddVocabularyModal
        isOpen={isAddVocabularyModalOpen}
        onClose={() => setIsAddVocabularyModalOpen(false)}
        onAddWords={handleAddVocabulary}
      />

      {/* Add Word Modal */}
      <AddWordModal
        isOpen={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
        onSave={handleAddWord}
      />

      {/* Edit Word Modal */}
      <EditWordModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingWord(null);
        }}
        onSave={handleSaveEdit}
        word={editingWord}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center">
          <div className="bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg max-w-sm">
            <p className="text-sm font-medium text-center">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWordsPage;