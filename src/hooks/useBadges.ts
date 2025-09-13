import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'practice' | 'vocabulary' | 'streak' | 'achievement' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
  isNew?: boolean;
}

interface BadgeStats {
  practiceSessionsCompleted: number;
  totalWordsLearned: number;
  perfectScores: number;
  currentStreak: number;
  longestStreak: number;
  totalPracticeTime: number;
  wordsAdded: number;
  textsAdded: number;
}

const ALL_BADGES: Badge[] = [
  // Practice Badges
  {
    id: 'first-practice',
    name: 'First Steps',
    description: 'Complete your first practice session',
    icon: '🎯',
    category: 'practice',
    rarity: 'common',
    maxProgress: 1
  },
  {
    id: 'practice-warrior',
    name: 'Practice Warrior',
    description: 'Complete 10 practice sessions',
    icon: '⚔️',
    category: 'practice',
    rarity: 'rare',
    maxProgress: 10
  },
  {
    id: 'practice-master',
    name: 'Practice Master',
    description: 'Complete 50 practice sessions',
    icon: '🏆',
    category: 'practice',
    rarity: 'epic',
    maxProgress: 50
  },
  {
    id: 'practice-legend',
    name: 'Practice Legend',
    description: 'Complete 100 practice sessions',
    icon: '👑',
    category: 'practice',
    rarity: 'legendary',
    maxProgress: 100
  },
  
  // Perfect Score Badges
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Get a perfect score in practice',
    icon: '💯',
    category: 'achievement',
    rarity: 'rare',
    maxProgress: 1
  },
  {
    id: 'ace-student',
    name: 'Ace Student',
    description: 'Get 5 perfect scores',
    icon: '🌟',
    category: 'achievement',
    rarity: 'epic',
    maxProgress: 5
  },
  
  // Vocabulary Badges
  {
    id: 'word-collector',
    name: 'Word Collector',
    description: 'Add 25 words to vocabulary',
    icon: '📚',
    category: 'vocabulary',
    rarity: 'common',
    maxProgress: 25
  },
  {
    id: 'vocabulary-builder',
    name: 'Vocabulary Builder',
    description: 'Add 100 words to vocabulary',
    icon: '🏗️',
    category: 'vocabulary',
    rarity: 'rare',
    maxProgress: 100
  },
  {
    id: 'word-master',
    name: 'Word Master',
    description: 'Learn 50 words (mark as learned)',
    icon: '🧠',
    category: 'vocabulary',
    rarity: 'epic',
    maxProgress: 50
  },
  
  // Streak Badges
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Practice 3 days in a row',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    maxProgress: 3
  },
  {
    id: 'streak-keeper',
    name: 'Streak Keeper',
    description: 'Practice 7 days in a row',
    icon: '🔥🔥',
    category: 'streak',
    rarity: 'rare',
    maxProgress: 7
  },
  {
    id: 'streak-legend',
    name: 'Streak Legend',
    description: 'Practice 30 days in a row',
    icon: '🔥🔥🔥',
    category: 'streak',
    rarity: 'legendary',
    maxProgress: 30
  },
  
  // Special Badges
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Practice before 8 AM',
    icon: '🌅',
    category: 'special',
    rarity: 'rare',
    maxProgress: 1
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Practice after 10 PM',
    icon: '🦉',
    category: 'special',
    rarity: 'rare',
    maxProgress: 1
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete practice in under 2 minutes',
    icon: '⚡',
    category: 'special',
    rarity: 'epic',
    maxProgress: 1
  },
  {
    id: 'text-explorer',
    name: 'Text Explorer',
    description: 'Add 5 practice texts',
    icon: '📖',
    category: 'vocabulary',
    rarity: 'rare',
    maxProgress: 5
  }
];

export function useBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<BadgeStats>({
    practiceSessionsCompleted: 0,
    totalWordsLearned: 0,
    perfectScores: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPracticeTime: 0,
    wordsAdded: 0,
    textsAdded: 0
  });
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  // Load badges and stats from localStorage
  useEffect(() => {
    if (!user) return;

    const savedBadges = localStorage.getItem(`badges-${user.uid}`);
    const savedStats = localStorage.getItem(`badge-stats-${user.uid}`);

    if (savedBadges) {
      const parsedBadges = JSON.parse(savedBadges, (key, value) => {
        if (key === 'earnedAt' && value) {
          return new Date(value);
        }
        return value;
      });
      setBadges(parsedBadges);
    }

    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [user]);

  // Save badges and stats to localStorage
  const saveBadges = useCallback((newBadges: Badge[]) => {
    if (!user) return;
    localStorage.setItem(`badges-${user.uid}`, JSON.stringify(newBadges));
    setBadges(newBadges);
  }, [user]);

  const saveStats = useCallback((newStats: BadgeStats) => {
    if (!user) return;
    localStorage.setItem(`badge-stats-${user.uid}`, JSON.stringify(newStats));
    setStats(newStats);
  }, [user]);

  // Check and award badges
  const checkBadges = useCallback((currentStats: BadgeStats) => {
    const earnedBadges = [...badges];
    const newlyEarned: Badge[] = [];

    ALL_BADGES.forEach(badge => {
      const alreadyEarned = earnedBadges.find(b => b.id === badge.id);
      if (alreadyEarned) return;

      let shouldEarn = false;
      let progress = 0;

      switch (badge.id) {
        case 'first-practice':
          shouldEarn = currentStats.practiceSessionsCompleted >= 1;
          progress = currentStats.practiceSessionsCompleted;
          break;
        case 'practice-warrior':
          shouldEarn = currentStats.practiceSessionsCompleted >= 10;
          progress = currentStats.practiceSessionsCompleted;
          break;
        case 'practice-master':
          shouldEarn = currentStats.practiceSessionsCompleted >= 50;
          progress = currentStats.practiceSessionsCompleted;
          break;
        case 'practice-legend':
          shouldEarn = currentStats.practiceSessionsCompleted >= 100;
          progress = currentStats.practiceSessionsCompleted;
          break;
        case 'perfectionist':
          shouldEarn = currentStats.perfectScores >= 1;
          progress = currentStats.perfectScores;
          break;
        case 'ace-student':
          shouldEarn = currentStats.perfectScores >= 5;
          progress = currentStats.perfectScores;
          break;
        case 'word-collector':
          shouldEarn = currentStats.wordsAdded >= 25;
          progress = currentStats.wordsAdded;
          break;
        case 'vocabulary-builder':
          shouldEarn = currentStats.wordsAdded >= 100;
          progress = currentStats.wordsAdded;
          break;
        case 'word-master':
          shouldEarn = currentStats.totalWordsLearned >= 50;
          progress = currentStats.totalWordsLearned;
          break;
        case 'streak-starter':
          shouldEarn = currentStats.currentStreak >= 3;
          progress = currentStats.currentStreak;
          break;
        case 'streak-keeper':
          shouldEarn = currentStats.currentStreak >= 7;
          progress = currentStats.currentStreak;
          break;
        case 'streak-legend':
          shouldEarn = currentStats.currentStreak >= 30;
          progress = currentStats.currentStreak;
          break;
        case 'early-bird':
          // This would be checked when practice is completed
          break;
        case 'night-owl':
          // This would be checked when practice is completed
          break;
        case 'speed-demon':
          // This would be checked when practice is completed
          break;
        case 'text-explorer':
          shouldEarn = currentStats.textsAdded >= 5;
          progress = currentStats.textsAdded;
          break;
      }

      if (shouldEarn) {
        const newBadge: Badge = {
          ...badge,
          earnedAt: new Date(),
          progress: badge.maxProgress,
          isNew: true
        };
        earnedBadges.push(newBadge);
        newlyEarned.push(newBadge);
      } else if (badge.maxProgress && progress > 0) {
        // Update progress for badges not yet earned
        const existingBadge = earnedBadges.find(b => b.id === badge.id);
        if (!existingBadge) {
          earnedBadges.push({
            ...badge,
            progress,
            isNew: false
          });
        }
      }
    });

    if (newlyEarned.length > 0) {
      saveBadges(earnedBadges);
      setNewBadges(newlyEarned);
    }

    return newlyEarned;
  }, [badges, saveBadges]);

  // Update stats and check for new badges
  const updateStats = useCallback((updates: Partial<BadgeStats>) => {
    const newStats = { ...stats, ...updates };
    saveStats(newStats);
    return checkBadges(newStats);
  }, [stats, saveStats, checkBadges]);

  // Specific update functions
  const completePracticeSession = useCallback((score: number, total: number, duration: number) => {
    const isPerfect = score === total;
    const currentHour = new Date().getHours();
    
    let newBadges = updateStats({
      practiceSessionsCompleted: stats.practiceSessionsCompleted + 1,
      perfectScores: stats.perfectScores + (isPerfect ? 1 : 0),
      totalPracticeTime: stats.totalPracticeTime + duration
    });

    // Check time-based badges
    const earnedBadges = [...badges];
    
    if (currentHour < 8 && !earnedBadges.find(b => b.id === 'early-bird')) {
      const earlyBirdBadge: Badge = {
        ...ALL_BADGES.find(b => b.id === 'early-bird')!,
        earnedAt: new Date(),
        progress: 1,
        isNew: true
      };
      earnedBadges.push(earlyBirdBadge);
      newBadges.push(earlyBirdBadge);
    }
    
    if (currentHour >= 22 && !earnedBadges.find(b => b.id === 'night-owl')) {
      const nightOwlBadge: Badge = {
        ...ALL_BADGES.find(b => b.id === 'night-owl')!,
        earnedAt: new Date(),
        progress: 1,
        isNew: true
      };
      earnedBadges.push(nightOwlBadge);
      newBadges.push(nightOwlBadge);
    }
    
    if (duration < 120 && !earnedBadges.find(b => b.id === 'speed-demon')) {
      const speedBadge: Badge = {
        ...ALL_BADGES.find(b => b.id === 'speed-demon')!,
        earnedAt: new Date(),
        progress: 1,
        isNew: true
      };
      earnedBadges.push(speedBadge);
      newBadges.push(speedBadge);
    }

    if (newBadges.length > 0) {
      saveBadges(earnedBadges);
      setNewBadges(newBadges);
    }

    return newBadges;
  }, [stats, badges, updateStats, saveBadges]);

  const addWord = useCallback(() => {
    return updateStats({
      wordsAdded: stats.wordsAdded + 1
    });
  }, [stats, updateStats]);

  const learnWord = useCallback(() => {
    return updateStats({
      totalWordsLearned: stats.totalWordsLearned + 1
    });
  }, [stats, updateStats]);

  const addText = useCallback(() => {
    return updateStats({
      textsAdded: stats.textsAdded + 1
    });
  }, [stats, updateStats]);

  const clearNewBadges = useCallback(() => {
    setNewBadges([]);
    // Mark badges as not new
    const updatedBadges = badges.map(badge => ({ ...badge, isNew: false }));
    saveBadges(updatedBadges);
  }, [badges, saveBadges]);

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      default: return 'border-gray-300';
    }
  };

  return {
    badges,
    stats,
    newBadges,
    completePracticeSession,
    addWord,
    learnWord,
    addText,
    clearNewBadges,
    getRarityColor,
    getRarityBorder,
    allBadges: ALL_BADGES
  };
}