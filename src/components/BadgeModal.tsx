import React from 'react';
import { X, Trophy, Star, Zap, Crown } from 'lucide-react';
import { Badge } from '../hooks/useBadges';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
  getRarityColor: (rarity: Badge['rarity']) => string;
  getRarityBorder: (rarity: Badge['rarity']) => string;
}

const BadgeModal: React.FC<BadgeModalProps> = ({ 
  isOpen, 
  onClose, 
  badges, 
  getRarityColor, 
  getRarityBorder 
}) => {
  if (!isOpen || badges.length === 0) return null;

  const getRarityIcon = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4" />;
      case 'rare': return <Trophy className="w-4 h-4" />;
      case 'epic': return <Zap className="w-4 h-4" />;
      case 'legendary': return <Crown className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getRarityName = (rarity: Badge['rarity']) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {badges.length === 1 ? 'New Badge Earned!' : `${badges.length} New Badges!`}
              </h2>
              <p className="text-sm text-gray-600">Congratulations! 🎉</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Badges */}
        <div className="p-6 space-y-4">
          {badges.map((badge, index) => (
            <div
              key={badge.id}
              className={`relative p-6 rounded-2xl border-2 ${getRarityBorder(badge.rarity)} bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white transform hover:scale-105 transition-all duration-300 animate-bounce`}
              style={{ animationDelay: `${index * 0.2}s`, animationDuration: '1s', animationFillMode: 'both' }}
            >
              {/* Rarity indicator */}
              <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                {getRarityIcon(badge.rarity)}
                <span className="text-xs font-medium">{getRarityName(badge.rarity)}</span>
              </div>

              {/* Badge content */}
              <div className="flex items-center space-x-4">
                <div className="text-4xl bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center">
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{badge.name}</h3>
                  <p className="text-white/90 text-sm mb-2">{badge.description}</p>
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-xs font-medium capitalize">{badge.category}</span>
                    </div>
                    {badge.earnedAt && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-xs font-medium">
                          {badge.earnedAt.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sparkle effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-4 right-8 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute bottom-2 right-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 text-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200"
          >
            Awesome! Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;