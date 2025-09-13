import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Volume2, Save, Loader2, BookOpen, Languages } from 'lucide-react';

// Where to call the function from:
// - In production (Netlify), leave empty => relative path "/.netlify/functions/translate"
// - In Bolt preview (local web sandbox), set VITE_FUNCTIONS_BASE in .env to your live Netlify URL
const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE || '';

async function translateWithGoogle(text: string, source = 'auto', target = 'hy'): Promise<string> {
  if (!text?.trim()) return '';

  const url = `${FUNCTIONS_BASE}/.netlify/functions/translate`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source, target }),
  });

  // Helpful error for debugging
  if (!res.ok) {
    let msg = 'Translation failed';
    try {
      const j = await res.json();
      msg = j?.error || msg;
    } catch {
      try {
        msg = (await res.text()) || msg;
      } catch {}
    }
    throw new Error(msg);
  }

  const data = await res.json();
  if (!data?.success || !data?.translatedText) {
    throw new Error(data?.error || 'No translation from server');
  }
  return data.translatedText as string;
}

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (word: { english: string; armenian: string }) => void;
}

interface DictionaryData {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition?: string;
  example?: string;
}

const AddWordModal: React.FC<AddWordModalProps> = ({ isOpen, onClose, onSave }) => {
  const [englishWord, setEnglishWord] = useState('');
  const [armenianTranslation, setArmenianTranslation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [dictionaryData, setDictionaryData] = useState<DictionaryData | null>(null);
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Debounce timer for definition fetch
  const translationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playPronunciation = useCallback(() => {
    if (!englishWord.trim()) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(englishWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, [englishWord]);

  const fetchDefinition = useCallback(async (word: string) => {
    if (!word.trim()) {
      setDictionaryData(null);
      return;
    }
    setIsLoadingDefinition(true);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`);
      if (!response.ok) throw new Error('Definition not found');
      const data = await response.json();
      const entry = data[0];
      if (entry) {
        const meaning = entry.meanings?.[0];
        const definition = meaning?.definitions?.[0];
        setDictionaryData({
          word: entry.word,
          phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
          partOfSpeech: meaning?.partOfSpeech,
          definition: definition?.definition,
          example: definition?.example,
        });
      }
    } catch {
      setDictionaryData(null);
    } finally {
      setIsLoadingDefinition(false);
    }
  }, []);

  const translateToArmenian = useCallback(async (word: string) => {
    if (!word.trim()) {
      setArmenianTranslation('');
      return;
    }
    setIsTranslating(true);
    setTranslationError(null);
    try {
      const translated = await translateWithGoogle(word.trim(), 'auto', 'hy');
      setArmenianTranslation(translated);
    } catch (error: any) {
      console.error('Translation error:', error);
      setTranslationError(`❌ ${error?.message || 'Translation failed. Please try again.'}`);
      setTimeout(() => setTranslationError(null), 4000);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const handleEnglishWordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEnglishWord(value);
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
      translationTimeoutRef.current = setTimeout(() => {
        fetchDefinition(value);
      }, 300);
    },
    [fetchDefinition]
  );

  const handleEnglishWordBlur = useCallback(() => {
    if (englishWord.trim()) translateToArmenian(englishWord);
  }, [englishWord, translateToArmenian]);

  const handleEnglishWordKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (translationTimeoutRef.current) clearTimeout(translationTimeoutRef.current);
        if (englishWord.trim()) translateToArmenian(englishWord);
      }
    },
    [englishWord, translateToArmenian]
  );

  useEffect(() => {
    return () => {
      if (translationTimeoutRef.current) clearTimeout(translationTimeoutRef.current);
    };
  }, []);

  const handleClose = useCallback(() => {
    setEnglishWord('');
    setArmenianTranslation('');
    setDictionaryData(null);
    setIsTranslating(false);
    setTranslationError(null);
    if (translationTimeoutRef.current) clearTimeout(translationTimeoutRef.current);
    onClose();
  }, [onClose]);

  const handleSave = useCallback(async () => {
    if (!englishWord.trim() || !armenianTranslation.trim()) return;
    setIsSaving(true);
    await onSave({ english: englishWord.trim(), armenian: armenianTranslation.trim() });
    setEnglishWord('');
    setArmenianTranslation('');
    setDictionaryData(null);
    setIsTranslating(false);
    setTranslationError(null);
    setIsSaving(false);
    onClose();
  }, [englishWord, armenianTranslation, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add New Word</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* English Word Input */}
          <div className="space-y-2">
            <label htmlFor="english-word" className="block text-sm font-medium text-gray-700">
              English Word
            </label>
            <div className="flex space-x-2">
              <input
                id="english-word"
                type="text"
                value={englishWord}
                onChange={handleEnglishWordChange}
                onBlur={handleEnglishWordBlur}
                onKeyDown={handleEnglishWordKeyDown}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter English word..."
                style={{ color: '#111827' }}
              />
              <button
                onClick={playPronunciation}
                disabled={!englishWord.trim()}
                className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Armenian Translation */}
          <div className="space-y-2">
            <label htmlFor="armenian-translation" className="block text-sm font-medium text-gray-700">
              <div className="flex items-center space-x-2">
                <Languages className="w-4 h-4" />
                <span>Armenian Translation</span>
                {isTranslating && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
              </div>
            </label>
            <input
              id="armenian-translation"
              type="text"
              value={armenianTranslation}
              onChange={(e) => setArmenianTranslation(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                isTranslating ? 'border-indigo-300 bg-indigo-50 text-gray-900' : 'border-gray-300 text-gray-900'
              }`}
              placeholder="Translation (Google)"
              disabled={isTranslating}
              style={{ color: '#111827' }}
            />
            {isTranslating && (
              <p className="text-xs text-indigo-600 flex items-center space-x-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Translating with Google…</span>
              </p>
            )}
          </div>

          {/* Definition */}
          {englishWord.trim() && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                Definition
              </label>
              <div className="p-4 bg-gray-50 rounded-lg border">
                {isLoadingDefinition ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin mr-2" />
                    <span className="text-gray-600">Loading definition...</span>
                  </div>
                ) : dictionaryData ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-800">{dictionaryData.word}</h4>
                      {dictionaryData.phonetic && <span className="text-gray-600">/{dictionaryData.phonetic}/</span>}
                      {dictionaryData.partOfSpeech && (
                        <span className="text-indigo-600 text-sm font-medium capitalize">
                          {dictionaryData.partOfSpeech}
                        </span>
                      )}
                    </div>
                    {dictionaryData.definition && <p className="text-gray-700">{dictionaryData.definition}</p>}
                    {dictionaryData.example && (
                      <p className="text-gray-600 italic text-sm">Example: "{dictionaryData.example}"</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-2">No definition found for "{englishWord}"</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={handleClose} className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!englishWord.trim() || !armenianTranslation.trim() || isSaving}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Word</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error toast */}
      {translationError && (
        <div className="fixed bottom-4 left-4 right-4 z-60 flex justify-center">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg max-w-sm">
            <p className="text-sm font-medium text-center">{translationError}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddWordModal;
