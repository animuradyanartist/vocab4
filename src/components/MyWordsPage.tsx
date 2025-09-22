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
  armenian: string; // ⚡ still the DB field
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
          // ⚡ Show as “Translation”, still read from word.armenian
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
  const learningWords = useMemo(() => words.filter(w => !w.isLearned), [words]);
  const learnedWords = useMemo(() => words.filter(w => w.isLearned), [words]);

  const filteredWords = useMemo(() => {
    const currentWords = activeTab === 'learning' ? learningWords : learnedWords;
    return currentWords
      .filter(word => word.english.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  }, [learningWords, learnedWords, activeTab, searchTerm]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const markAsLearned = useCallback(async (wordId: string) => {
    await updateWord(wordId, { isLearned: true });
    learnWord();
    showToast('Marked as Learned ✅');
  }, [updateWord, learnWord, showToast]);

  const moveBackToLearning = useCallback(async (wordId: string) => {
    await updateWord(wordId, { isLearned: false });
    showToast('Moved back to My Words 📘');
  }, [updateWord, showToast]);

  const handleDeleteWord = useCallback(async (wordId: string) => {
    await deleteWord(wordId);
    showToast('Word deleted 🗑️');
  }, [deleteWord, showToast]);

  const handleEditWord = useCallback((word: Word) => {
    setEditingWord(word);
    setIsEditModalOpen(true);
  }, []);

  // ⚡ updated param names (translation)
  const handleSaveEdit = useCallback((updatedWord: { english: string; translation: string }) => {
    if (!editingWord) return;
    updateWord(editingWord.id, {
      english: updatedWord.english,
      armenian: updatedWord.translation, // ⚡ map back to DB field
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
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }, []);

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

  const handleAddVocabulary = useCallback(async (newWords: { english: string; translation: string }[]) => {
    await addWords(newWords.map(w => ({ ...w, armenian: w.translation }))); // ⚡ map translation → armenian
    newWords.forEach(() => addWord());
  }, [addWords, addWord]);

  const handleAddWord = useCallback(async (newWord: { english: string; translation: string }) => {
    await addWords([{ english: newWord.english, armenian: newWord.translation }]); // ⚡ map translation → armenian
    addWord();
    showToast('Word added! ✅');
  }, [addWords, addWord, showToast]);

  // ... rest (loading, render, modals) unchanged ...

  return (
    // JSX same as your version (header, tabs, search, list, modals, toast)
    // ✅ Already changed “Tap to reveal translation” label above
    // ✅ No need to change the modals section — they now use translation param
    <>
      {/* ... paste same JSX as you had ... */}
    </>
  );
};

export default MyWordsPage;
