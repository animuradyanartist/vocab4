import React from 'react';
import { Download, X, RefreshCw } from 'lucide-react';
import { usePWAUpdate } from '../hooks/usePWAUpdate';

const PWAUpdateNotification: React.FC = () => {
  const { updateAvailable, updateApp, dismissUpdate } = usePWAUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-4 animate-slide-down">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              App Update Available
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              A new version of Vocabulary Learner is ready. Update now to get the latest features and improvements.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={updateApp}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium py-2 px-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-1"
              >
                <Download className="w-3 h-3" />
                <span>Update Now</span>
              </button>
              <button
                onClick={dismissUpdate}
                className="text-gray-500 hover:text-gray-700 p-2 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;