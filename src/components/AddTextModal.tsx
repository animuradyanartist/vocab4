import React, { useState } from 'react';
import { X, Save, Loader2, FileText } from 'lucide-react';

interface AddTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: { title: string; content: string }) => void;
}

const AddTextModal: React.FC<AddTextModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsSaving(true);
    
    setTimeout(() => {
      onSave({
        title: title.trim(),
        content: content.trim()
      });
      
      setTitle('');
      setContent('');
      setIsSaving(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Add New Text</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="text-title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="text-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter a title for your text..."
              maxLength={100}
              style={{ color: '#111827' }}
            />
            <div className="text-xs text-gray-500 text-right">
              {title.length}/100 characters
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <label htmlFor="text-content" className="block text-sm font-medium text-gray-700">
              Text Content
            </label>
            <textarea
              id="text-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900"
              placeholder="Paste or type your text here..."
              rows={12}
             style={{ color: '#111827' }}
            />
            <div className="text-xs text-gray-500 text-right">
              {content.length} characters
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-2">💡 Tips:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Add articles, stories, or any English text you want to practice with</li>
              <li>• You can tap on any word in the text to translate and add it to your vocabulary</li>
              <li>• Longer texts work better for discovering new vocabulary</li>
            </ul>
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
            disabled={!title.trim() || !content.trim() || isSaving}
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
                <span>Save Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTextModal;