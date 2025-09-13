import React, { useState } from 'react';
import { Globe, BookOpen, Save, Eye, Calendar, User } from 'lucide-react';
import { usePublicTexts } from '../hooks/usePublicTexts';
import { useAuth } from '../hooks/useAuth';

const PublicTextsPage: React.FC = () => {
  const { user } = useAuth();
  const { publicTexts, loading, savePublicText } = usePublicTexts();
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveText = async (textId: string) => {
    const result = await savePublicText(textId);
    if (result.success) {
      showToast('Text saved to My Texts! 📚');
    } else {
      showToast(result.error || 'Failed to save text. Please try again.');
    }
  };

  const handleViewText = (textId: string) => {
    setSelectedText(selectedText === textId ? null : textId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading public texts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Public Texts</h1>
              <p className="text-sm text-gray-600">
                {publicTexts.length} text{publicTexts.length !== 1 ? 's' : ''} available for practice
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {publicTexts.length > 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Available Texts</h2>
              <p className="text-sm text-gray-600">Click on any text to practice vocabulary</p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {publicTexts.map((text) => (
                <div key={text.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {text.title}
                      </h3>
                      
                      {selectedText === text.id ? (
                        <div className="mb-4">
                          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {text.body}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {text.body.substring(0, 200)}
                          {text.body.length > 200 ? '...' : ''}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Added {new Date(text.created_at).toLocaleDateString()}</span>
                        <User className="w-4 h-4 ml-4 mr-1" />
                        <span>By Admin</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewText(text.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{selectedText === text.id ? 'Hide' : 'View'} Text</span>
                    </button>
                    
                    <button
                      onClick={() => handleSaveText(text.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                    >
                      <Save className="w-4 h-4" />
                      <span>Add to My Texts</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Public Texts</h2>
              <p className="text-gray-600 mb-6">
                No public texts are available at the moment. Check back later!
              </p>
            </div>
          </div>
        )}
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

export default PublicTextsPage;