import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  Search, Eye, EyeOff, Plus, Volume2, Check,
  RotateCcw, BookOpen, CheckCircle, Trash2, Edit3
} from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useBadges } from '../hooks/useBadges';
import AddVocabularyModal from './AddVocabularyModal';
import AddWordModal from './AddWordModal';
import EditWordModal from './EditWordModal';

interface Word {
  id: string;
  english: string;
  armenian: string; // ⚡ DB field
  dateAdded: Date;
  isLearned?: boolean;
}

// ----------------- Word Item -----------------
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
      className="flex items-center justify-between p-3 md:p-4 border-b border-gray-100
      last:border-b-0 hover:bg-gray-50/50 transition-colors duration-200 group cursor-pointer"
      onClick={() => onWordSelect(word)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 truncate">
            {word.english}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); onPlayPronunciation(word.english); }}
            className="p-1 md:p-1.5 rounded-full hover:bg-indigo-100 transition-colors
            duration-200 flex-shrink-0"
            title="Play pronunciation"
          >
            <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-indigo-500 hover:text-indigo-600" />
          </button>
        </div>
        {isRevealed ? (
          <p className="text-sm md:text-base text-indigo-600 font-medium mt-1">
            {word.armenian}
          </p>
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
        {activeTab === 'learning'
          ? <Check className="w-4 h-4 md:w-5 md:h-5" />
          : <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onEditWord(word); }}
        className="ml-1 md:ml-2 p-1.5 md:p-2 rounded-full hover:bg-blue-100 text-blue-600
        hover:text-blue-700 transition-colors duration-200 flex-shrink-0"
        title="Edit Word"
      >
        <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDeleteWord(word.id); }}
        className="ml-1 md:ml-2 p-1.5 md:p-2 rounded-full hover:bg-red-100 text-red-600
        hover:text-red-700 transition-colors duration-200 flex-shrink-0"
        title="Delete Word"
      >
        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleReveal(word.id); }}
        className="ml-1 md:ml-2 p-1.5 md:p-2 rounded-full hover:bg-gray-100
        transition-colors duration-200 flex-shrink-0"
      >
        {isRevealed
          ? <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          : <Eye className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />}
      </button>
    </div>
  );
});

WordItem.displayName = 'WordItem';

// ----------------- Page -----------------
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

  // Separate words
  const learningWords = useMemo(() => words.filter(w => !w.isLearned), [words]);
  const learnedWords = useMemo(() => words.filter(w => w.isLearned), [words]);

  const filteredWords = useMemo(() => {
    const list = activeTab === 'learning' ? learningWords : learnedWords;
    return list
      .filter(w => w.english.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  }, [learningWords, learnedWords, activeTab, searchTerm]);

  // Toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Actions
  const markAsLearned = useCallback(async (id: string) => {
    await updateWord(id, { isLearned: true });
    learnWord();
    showToast('Marked as Learned ✅');
  }, [updateWord, learnWord, showToast]);

  const moveBackToLearning = useCallback(async (id: string) => {
    await updateWord(id, { isLearned: false });
    showToast('Moved back to My Words 📘');
  }, [updateWord, showToast]);

  const handleDeleteWord = useCallback(async (id: string) => {
    await deleteWord(id);
    showToast('Word deleted 🗑️');
  }, [deleteWord, showToast]);

  const handleEditWord = useCallback((word: Word) => {
    setEditingWord(word);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback((w: { english: string; translation: string }) => {
    if (!editingWord) return;
    updateWord(editingWord.id, {
      english: w.english,
      armenian: w.translation // ⚡ map translation → DB field
    });
    showToast('Word updated ✏️');
    setEditingWord(null);
  }, [editingWord, updateWord, showToast]);

  const toggleAllTranslations = useCallback(() => {
    if (showAllTranslations) {
      setRevealedWords(new Set());
    } else {
      setRevealedWords(new Set(filteredWords.map(w => w.id)));
    }
    setShowAllTranslations(!showAllTranslations);
  }, [showAllTranslations, filteredWords]);

  const toggleWordReveal = useCallback((id: string) => {
    setRevealedWords(prev => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  }, []);

  const playPronunciation = useCallback((word: string) => {
    if (!word.trim()) return;
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US'; u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  }, []);

  const handleAddVocabulary = useCallback(async (list: { english: string; translation: string }[]) => {
    await addWords(list.map(w => ({ english: w.english, armenian: w.translation })));
    list.forEach(() => addWord());
  }, [addWords, addWord]);

  const handleAddWord = useCallback(async (w: { english: string; translation: string }) => {
    await addWords([{ english: w.english, armenian: w.translation }]);
    addWord();
    showToast('Word added! ✅');
  }, [addWords, addWord, showToast]);

  // Loading
  if (loading && words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
        <p className="text-gray-600">Loading vocabulary…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Vocabulary</h1>
            <p className="text-sm text-gray-600">
              {learningWords.length} learning • {learnedWords.length} learned
            </p>
          </div>
          <button
            onClick={() => setIsAddWordModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white p-3 rounded-full shadow-lg hover:from-indigo-600 hover:to-cyan-600 focus:outline-none"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('learning')}
            className={`flex-1 py-3 rounded-xl font-medium ${
              activeTab === 'learning'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
                : 'bg-white/80 text-gray-600'
            }`}
          >
            📘 My Words ({learningWords.length})
          </button>
          <button
            onClick={() => setActiveTab('learned')}
            className={`flex-1 py-3 rounded-xl font-medium ${
              activeTab === 'learned'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-white/80 text-gray-600'
            }`}
          >
            ✅ Learned ({learnedWords.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab} words…`}
            className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white/80"
          />
        </div>

        {/* Words */}
        <div className="bg-white/80 rounded-xl shadow border">
          <div className="flex justify-between items-center p-3 border-b">
            <h2 className="font-semibold">{activeTab === 'learning' ? '📘 My Words' : '✅ Learned'} ({filteredWords.length})</h2>
            <button onClick={toggleAllTranslations} className="text-sm text-indigo-600">
              {showAllTranslations ? 'Hide All' : 'Show All'}
            </button>
          </div>
          {filteredWords.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {filteredWords.map(w => (
                <WordItem
                  key={w.id}
                  word={w}
                  isRevealed={revealedWords.has(w.id)}
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
            <p className="p-6 text-center text-gray-500">No words found.</p>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddVocabularyModal
        isOpen={isAddVocabularyModalOpen}
        onClose={() => setIsAddVocabularyModalOpen(false)}
        onAddWords={handleAddVocabulary}
      />
      <AddWordModal
        isOpen={isAddWordModalOpen}
        onClose={() => setIsAddWordModalOpen(false)}
        onSave={handleAddWord}
      />
      <EditWordModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingWord(null); }}
        onSave={handleSaveEdit}
        word={editingWord}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center">
          <div className="bg-gray-800 text-white px-6 py-3 rounded-xl">{toastMessage}</div>
        </div>
      )}
    </div>
  );
};

export default MyWordsPage;
