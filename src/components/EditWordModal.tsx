import React, { useState, useEffect } from 'react';
import { X, Volume2, Save, Loader2 } from 'lucide-react';

interface Word {
  id: string;
  english: string;
  armenian: string;
  dateAdded: Date;
  isLearned?: boolean;
}

interface EditWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (word: { english: string; armenian: string }) => void;
  word: Word | null;
}

const EditWordModal: React.FC<EditWordModalProps> = ({ isOpen, onClose, onSave, word }) => {
  const [englishWord, setEnglishWord] = useState('');
  const [armenianTranslation, setArmenianTranslation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (word) {
      setEnglishWord(word.english);
      setArmenianTranslation(word.armenian);
    }
  }, [word]);

  const playPronunciation = () => {
    if (!englishWord.trim()) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(englishWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSave = () => {
    if (!englishWord.trim() || !armenianTranslation.trim()) return;
    
    setIsSaving(true);
    
    setTimeout(() => {
      onSave({
        english: englishWord.trim(),
        armenian: armenianTranslation.trim()
      });
      
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const handleClose = () => {
    setEnglishWord('');
    setArmenianTranslation('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Edit Word</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
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
                onChange={(e) => setEnglishWord(e.target.value)}
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
              Armenian Translation
            </label>
            <input
              id="armenian-translation"
              type="text"
              value={armenianTranslation}
              onChange={(e) => setArmenianTranslation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter Armenian translation..."
               style={{ color: '#111827' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
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
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditWordModal;