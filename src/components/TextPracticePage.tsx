import React, { useState } from 'react';
import { Plus, FileText, Trash2, Eye, Calendar, Globe, User, Search, Share2 } from 'lucide-react';
import { useTexts, CustomText } from '../hooks/useTexts';
import { usePublicTexts, PublicText } from '../hooks/usePublicTexts';
import { useBadges } from '../hooks/useBadges';
import AddTextModal from './AddTextModal';

interface TextPracticePageProps {
  onTextSelect: (text: CustomText) => void;
}

const TextPracticePage: React.FC<TextPracticePageProps> = ({ onTextSelect }) => {
  const { texts, loading, addText, deleteText } = useTexts();
  const { publicTexts, loading: publicTextsLoading, savePublicText } = usePublicTexts();
  const { addText: addTextBadge } = useBadges();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-texts' | 'public-texts'>('my-texts');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Convert public texts to CustomText format
  const convertedPublicTexts: CustomText[] = publicTexts.map(text => ({
    id: text.id,
    title: text.title,
    content: text.body,
    dateAdded: new Date(text.created_at)
  }));

  // Get current texts based on active tab
  const currentTexts = activeTab === 'my-texts' ? texts : convertedPublicTexts;

  // Filter texts based on search term
  const filteredTexts = currentTexts.filter(text =>
    text.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    text.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTextSelect = (text: CustomText) => {
    // Pass additional info about whether this is a public text
    const textWithMetadata = {
      ...text,
      isPublicText: activeTab === 'public-texts'
    };
    onTextSelect(textWithMetadata);
  };
  const handleAddText = async (newText: { title: string; content: string }) => {
    const result = await addText(newText);
    if (result.success) {
      addTextBadge(); // Award badge progress
      showToast('Text added successfully! 📝');
    } else {
      showToast('Failed to add text. Please try again.');
    }
  };

  const handleAddPublicTextToMyTexts = async (publicText: CustomText) => {
    const result = await savePublicText(publicText.id);
    if (result.success) {
      showToast('Text added to My Texts! 📚');
      // Optionally reload texts to show the new addition immediately
      // This would require exposing a reload function from useTexts hook
    } else {
      showToast(`Failed to add text: ${result.error || 'Please try again.'}`);
    }
  };
  const handleDeleteText = async (textId: string) => {
    // Only allow deleting user texts, not public texts
    if (activeTab === 'public-texts') {
      showToast('Cannot delete public texts');
      return;
    }

    if (confirm('Are you sure you want to delete this text?')) {
      const result = await deleteText(textId);
      if (result.success) {
        showToast('Text deleted 🗑️');
      } else {
        showToast('Failed to delete text. Please try again.');
      }
    }
  };

  const handleShareText = async (text: CustomText) => {
    try {
      // Create shareable link
      const textType = activeTab === 'public-texts' ? 'public' : 'personal';
      const shareUrl = `${window.location.origin}${window.location.pathname}?text=${text.id}&type=${textType}`;
      
      const shareData = {
        title: `${text.title} - ${activeTab === 'public-texts' ? 'Public' : 'Personal'} Vocabulary Practice Text`,
        text: `Check out this vocabulary practice text: "${text.title}"`,
        url: shareUrl
      };

      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showToast('Link shared successfully! 🔗');
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard! 📋');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Final fallback: Copy link to clipboard
        try {
          const textType = activeTab === 'public-texts' ? 'public' : 'personal';
          const shareUrl = `${window.location.origin}${window.location.pathname}?text=${text.id}&type=${textType}`;
          await navigator.clipboard.writeText(shareUrl);
          showToast('Link copied to clipboard! 📋');
        } catch (clipboardError) {
          showToast('Unable to share link. Please try again.');
        }
      }
    }
  };

  if (loading || publicTextsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading texts...</p>
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Text Practice</h1>
            <p className="text-xs md:text-sm text-gray-600">
              {texts.length} personal • {publicTexts.length} public texts
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white p-2 md:p-3 rounded-full shadow-lg hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 transform hover:scale-110 transition-all duration-200"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-2 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('my-texts')}
              className={`flex-1 flex items-center justify-center space-x-1 md:space-x-2 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'my-texts'
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">📝 My Texts ({texts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('public-texts')}
              className={`flex-1 flex items-center justify-center space-x-1 md:space-x-2 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'public-texts'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">📚 Public Texts ({publicTexts.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-3 md:p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
              placeholder={`Search ${activeTab === 'my-texts' ? 'your' : 'public'} texts...`}
              style={{ color: '#111827' }}
            />
          </div>
        </div>

        {filteredTexts.length > 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-3 md:p-4 border-b border-gray-200">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">
                {activeTab === 'my-texts' ? '📝 My Texts' : '📚 Public Texts'}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {activeTab === 'my-texts' 
                  ? 'Your personal texts for vocabulary practice'
                  : 'Community texts available for all users to practice with'
                }
              </p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredTexts.map((text) => (
                <div
                  key={text.id}
                  className="p-3 md:p-4 hover:bg-gray-50/50 transition-colors duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleTextSelect(text)}
                    >
                      <h3 className={`text-base md:text-lg font-semibold mb-2 group-hover:text-indigo-600 transition-colors duration-200 ${
                        activeTab === 'public-texts' ? 'text-green-700' : 'text-gray-800'
                      }`}>
                        {text.title}
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">
                        {text.content.substring(0, 150)}
                        {text.content.length > 150 ? '...' : ''}
                      </p>
                      <div className="flex items-center text-xs md:text-sm text-gray-500">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span>Added {text.dateAdded.toLocaleDateString()}</span>
                        {activeTab === 'public-texts' && (
                          <span className="ml-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 md:space-x-2 ml-2 md:ml-4">
                      {activeTab === 'public-texts' && (
                        <button
                          onClick={() => handleAddPublicTextToMyTexts(text)}
                          className="p-1.5 md:p-2 rounded-full hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors duration-200"
                          title="Add to My Texts"
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleShareText(text)}
                        className="p-1.5 md:p-2 rounded-full hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors duration-200"
                        title="Share Text"
                      >
                        <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                      {activeTab === 'my-texts' && (
                        <button
                          onClick={() => handleDeleteText(text.id)}
                          className="p-1.5 md:p-2 rounded-full hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors duration-200"
                          title="Delete Text"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <FileText className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
                {searchTerm ? 'No Matching Texts' : 'No Texts Yet'}
              </h2>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                {searchTerm 
                  ? `No texts found matching "${searchTerm}"`
                  : activeTab === 'my-texts' 
                    ? 'Add your first text to start practicing vocabulary in context!'
                    : 'No public texts available at the moment.'
                }
              </p>
              {activeTab === 'my-texts' && !searchTerm && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 text-sm md:text-base"
                >
                  Add Your First Text
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Text Modal */}
      <AddTextModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddText}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-gray-800">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TextPracticePage;