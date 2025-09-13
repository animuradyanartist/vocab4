import React, { useState, useCallback } from 'react';
import { ArrowLeft, Loader2, Check, Plus, X, BookmarkPlus } from 'lucide-react';
import { CustomText } from '../hooks/useTexts';
import { useFirestore } from '../hooks/useFirestore';
import { usePublicTexts } from '../hooks/usePublicTexts';

interface TextViewPageProps {
  text: CustomText;
  onBack: () => void;
  isPublicText?: boolean;
}

const TextViewPage: React.FC<TextViewPageProps> = ({ text, onBack, isPublicText = false }) => {
  const { words, addWords } = useFirestore();
  const { savePublicText } = usePublicTexts();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [translatedWord, setTranslatedWord] = useState<{ english: string; armenian: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const translateWord = useCallback(async (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    
    setIsTranslating(true);
    setSelectedWord(cleanWord);
    setTranslatedWord(null);

    try {
      const response = await fetch('/.netlify/functions/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanWord,
          source: 'en',
          target: 'hy'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Translation service unavailable' }));
        throw new Error(errorData.error || 'Translation failed');
      }

      const data = await response.json();
      
      if (data.success && data.translatedText) {
        // Show translation to user
        setTranslatedWord({
          english: cleanWord,
          armenian: data.translatedText
        });
      } else {
        throw new Error(data.error || 'No translation found');
      }
    } catch (error) {
      console.error('Translation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      showToast(`❌ ${errorMessage}`);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const saveWordToVocabulary = useCallback(async () => {
    if (!translatedWord) return;

    // Check if word already exists
    const existingWord = words.find(w => w.english.toLowerCase() === translatedWord.english.toLowerCase());
    if (existingWord) {
      showToast('Word already exists in your vocabulary! 📚');
      setTranslatedWord(null);
      setSelectedWord(null);
      return;
    }

    const result = await addWords([translatedWord]);

    if (result.success) {
      showToast(`✅ "${translatedWord.english}" added to vocabulary!`);
    } else {
      showToast('❌ Failed to add word. Please try again.');
    }

    setTranslatedWord(null);
    setSelectedWord(null);
  }, [translatedWord, words, addWords]);

  const cancelTranslation = useCallback(() => {
    setTranslatedWord(null);
    setSelectedWord(null);
  }, []);

  const handleAddToMyTexts = useCallback(async () => {
    if (!isPublicText) return;
    
    const result = await savePublicText(text.id);
    if (result.success) {
      showToast('✅ Text added to My Texts!');
    } else {
      showToast(`❌ Failed to add text: ${result.error || 'Please try again.'}`);
    }
  }, [isPublicText, savePublicText, text.id]);

  const handleWordClick = (word: string) => {
    if (isTranslating) return;
    
    // Clean the word (remove punctuation, etc.)
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length < 2) return; // Skip very short words
    
    translateWord(cleanWord);
  };

  const renderTextWithClickableWords = (content: string) => {
    // Split text into words while preserving spaces and punctuation
    const parts = content.split(/(\s+)/);
    
    return parts.map((part, index) => {
      // If it's whitespace, render as-is
      if (/^\s+$/.test(part)) {
        return <span key={index}>{part}</span>;
      }
      
      // If it contains letters, make it clickable
      if (/[a-zA-Z]/.test(part)) {
        const isSelected = selectedWord === part.toLowerCase().replace(/[^\w]/g, '');
        
        return (
          <span
            key={index}
            onClick={() => handleWordClick(part)}
            className={`cursor-pointer hover:bg-indigo-100 hover:text-indigo-700 rounded px-1 transition-all duration-200 ${
              isSelected ? 'bg-indigo-200 text-indigo-800' : ''
            } ${isTranslating ? 'cursor-wait' : 'hover:shadow-sm'}`}
            title="Click to translate and add to vocabulary"
          >
            {part}
          </span>
        );
      }
      
      // Otherwise, render as-is (punctuation, etc.)
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-800 truncate">{text.title}</h1>
            <p className="text-sm text-gray-600">
              {isPublicText ? 'Public text • ' : ''}Tap any word to translate and add to vocabulary
            </p>
          </div>
          {isPublicText && (
            <button
              onClick={handleAddToMyTexts}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
            >
              <BookmarkPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Add to My Texts</span>
            </button>
          )}
          {isTranslating && (
            <div className="flex items-center space-x-2 text-indigo-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Translating...</span>
            </div>
          )}
        </div>
      </header>

      {/* Translation Modal */}
      {translatedWord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Translation</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">English</p>
                    <p className="text-lg font-semibold text-gray-800">{translatedWord.english}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Armenian</p>
                    <p className="text-lg font-semibold text-indigo-600">{translatedWord.armenian}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelTranslation}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={saveWordToVocabulary}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg hover:from-indigo-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Word</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl border border-indigo-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">How to use:</h3>
            </div>
            <p className="text-sm text-gray-700">
              Click on any word in the text below to see its Armenian translation, then choose whether to save it to your vocabulary.
            </p>
          </div>

          {/* Text Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap select-none">
              {renderTextWithClickableWords(text.content)}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Added on {text.dateAdded.toLocaleDateString()}</span>
              <span>{text.content.split(/\s+/).length} words</span>
            </div>
          </div>
        </div>
      </main>

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

export default TextViewPage;