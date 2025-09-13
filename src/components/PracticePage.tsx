import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, Check, X, Brain, Trophy } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useBadges } from '../hooks/useBadges';
import BadgeModal from './BadgeModal';

interface Word {
  id: string;
  english: string;
  armenian: string;
  dateAdded: Date;
  isLearned?: boolean;
}

const PracticePage: React.FC = () => {
  const { words, loading } = useFirestore();
  const { 
    badges, 
    newBadges, 
    completePracticeSession, 
    clearNewBadges, 
    getRarityColor, 
    getRarityBorder 
  } = useBadges();
  
  const [currentSession, setCurrentSession] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Get words that are not marked as known
  const availableWords = useMemo(() => {
    return words.filter(word => !word.isLearned);
  }, [words]);

  // Generate 4 answer options (1 correct + 3 wrong)
  const generateAnswerOptions = useCallback((correctWord: Word, allWords: Word[]) => {
    const options = [correctWord.armenian];
    const otherWords = allWords.filter(w => w.id !== correctWord.id);
    
    // Add 3 random wrong answers
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
      options.push(shuffledOthers[i].armenian);
    }
    
    // If we don't have enough words, generate some fake options
    while (options.length < 4) {
      const fakeOptions = [
        'Բարև ձեզ', 'Շնորհակալություն', 'Ցտեսություն', 'Ինչպես եք',
        'Լավ եմ', 'Ներողություն', 'Այո', 'Ոչ', 'Խնդրեմ', 'Կարող եմ',
        'Չգիտեմ', 'Օգնություն', 'Ժամանակ', 'Փող', 'Տուն', 'Աշխատանք'
      ];
      const randomFake = fakeOptions[Math.floor(Math.random() * fakeOptions.length)];
      if (!options.includes(randomFake)) {
        options.push(randomFake);
      }
    }
    
    // Shuffle the options
    return options.sort(() => Math.random() - 0.5);
  }, []);
  // Start a new practice session
  const startNewSession = useCallback((wordCount = 5) => {
    if (availableWords.length === 0) return;
    
    const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
    const sessionWords = shuffled.slice(0, Math.min(wordCount, shuffled.length));
    
    setCurrentSession(sessionWords);
    setCurrentWordIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setSessionStats({ correct: 0, total: 0 });
    setSessionStartTime(new Date());
    
    // Generate options for first word
    if (sessionWords.length > 0) {
      const options = generateAnswerOptions(sessionWords[0], availableWords);
      setAnswerOptions(options);
    }
  }, [availableWords, generateAnswerOptions]);

  // Initialize session on component mount
  useEffect(() => {
    if (availableWords.length > 0 && currentSession.length === 0) {
      // Check if this is a notification-triggered practice (3 words)
      const urlParams = new URLSearchParams(window.location.search);
      const isNotificationPractice = urlParams.get('notification') === 'true';
      startNewSession(isNotificationPractice ? 3 : 5);
    }
  }, [availableWords]);

  // Generate new options when word changes
  useEffect(() => {
    if (currentSession.length > 0 && currentWordIndex < currentSession.length) {
      const currentWord = currentSession[currentWordIndex];
      const options = generateAnswerOptions(currentWord, availableWords);
      setAnswerOptions(options);
    }
  }, [currentWordIndex, currentSession, availableWords, generateAnswerOptions]);
  const currentWord = currentSession[currentWordIndex];

  const handleAnswerSelect = useCallback((answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentWord?.armenian;
    setIsCorrect(correct);
    setShowResult(true);
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
  }, [currentWord, showResult]);


  const handleNext = useCallback(() => {
    if (currentWordIndex < currentSession.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Session completed - award badges
      if (sessionStartTime) {
        const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
        const newBadges = completePracticeSession(sessionStats.correct, sessionStats.total, duration);
        
        if (newBadges.length > 0) {
          setShowBadgeModal(true);
        }
      }
      
      setCurrentSession([]);
      setCurrentWordIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswerOptions([]);
      setSessionStartTime(null);
    }
  }, [currentWordIndex, currentSession.length, sessionStats, sessionStartTime, completePracticeSession]);

  const handleSkip = useCallback(() => {
    // Mark as incorrect when skipping
    setSessionStats(prev => ({
      correct: prev.correct,
      total: prev.total + 1
    }));
    handleNext();
  }, [handleNext]);

  const handleAlreadyKnow = useCallback(() => {
    if (!currentWord) return;

    // Mark word as known locally for immediate feedback
    setCurrentSession(prev => 
      prev.map(word => 
        word.id === currentWord.id ? { ...word, isLearned: true } : word
      )
    );

    // Mark as correct when already known
    setSessionStats(prev => ({
      correct: prev.correct + 1,
      total: prev.total + 1
    }));

    // Move to next word or end session
    handleNext();
  }, [currentWord, handleNext]);

  const handleCloseBadgeModal = useCallback(() => {
    setShowBadgeModal(false);
    clearNewBadges();
  }, [clearNewBadges]);

  const isSessionComplete = currentSession.length > 0 && currentWordIndex >= currentSession.length;

  // Show loading only on initial load, not when words are cached
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (availableWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 pb-20">
        <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Practice</h1>
            <p className="text-sm text-gray-600">Test your vocabulary knowledge</p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Words to Practice</h2>
            <p className="text-gray-600 mb-6">
              You need to add some words to your vocabulary before you can practice. 
              Go to "My Words" to add new vocabulary.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (currentSession.length === 0 || isSessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 pb-20">
        <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Practice</h1>
            <p className="text-sm text-gray-600">Test your vocabulary knowledge</p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8 text-center">
            {isSessionComplete && (
              <div className="mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Session Complete!</h2>
                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-4 mb-6">
                  <p className="text-lg font-semibold text-gray-800">
                    Score: {sessionStats.correct}/{sessionStats.total}
                  </p>
                  <p className="text-sm text-gray-600">
                    {Math.round((sessionStats.correct / sessionStats.total) * 100)}% correct
                  </p>
                  {sessionStats.correct === sessionStats.total && (
                    <div className="mt-2 flex items-center justify-center space-x-1">
                      <span className="text-2xl">🎉</span>
                      <span className="text-sm font-medium text-green-600">Perfect Score!</span>
                      <span className="text-2xl">🎉</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Practice?</h2>
            <p className="text-gray-600 mb-6">
              Test your knowledge with {Math.min(5, availableWords.length)} random words from your vocabulary.
            </p>
            <button
              onClick={startNewSession}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-medium hover:from-indigo-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Start New Practice</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 pb-20">
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 md:px-4 py-3 md:py-4">
          {currentSession.length > 0 && !isSessionComplete ? (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Practice</h1>
                <p className="text-xs md:text-sm text-gray-600">
                  Word {currentWordIndex + 1} of {currentSession.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs md:text-sm text-gray-600">Score</div>
                <div className="text-base md:text-lg font-bold text-indigo-600">
                  {sessionStats.correct}/{sessionStats.total}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Practice</h1>
              <p className="text-xs md:text-sm text-gray-600">Test your vocabulary knowledge</p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{currentWordIndex + 1}/{currentSession.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentWordIndex + 1) / currentSession.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Word */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
              {currentWord?.english}
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Select the correct Armenian translation
            </p>
          </div>

          {/* Multiple Choice Options */}
          <div className="mb-6 space-y-3">
            {answerOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`w-full px-4 md:px-6 py-3 md:py-4 text-base md:text-lg border-2 rounded-xl transition-all duration-200 text-center font-medium ${
                  showResult
                    ? option === currentWord?.armenian
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : option === selectedAnswer && option !== currentWord?.armenian
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-300 bg-gray-50 text-gray-600'
                    : selectedAnswer === option
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-indigo-300 hover:bg-indigo-50'
                } disabled:cursor-default`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1">{option}</span>
                  {showResult && option === currentWord?.armenian && (
                    <Check className="w-5 h-5 text-green-600 ml-2" />
                  )}
                  {showResult && option === selectedAnswer && option !== currentWord?.armenian && (
                    <X className="w-5 h-5 text-red-600 ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Result Display */}
          {showResult && (
            <div className={`mb-6 p-3 md:p-4 rounded-xl text-center ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-center space-x-2 mb-1 md:mb-2">
                {isCorrect ? (
                  <>
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    <span className="text-base md:text-lg font-semibold text-green-800">Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                    <span className="text-base md:text-lg font-semibold text-red-800">Incorrect</span>
                  </>
                )}
              </div>
              {!isCorrect && (
                <p className="text-sm md:text-base text-red-700">
                  Correct answer: <span className="font-semibold">{currentWord?.armenian}</span>
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 md:space-y-4">
            {showResult ? (
              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 md:py-4 px-4 md:px-6 rounded-xl font-medium hover:from-indigo-600 hover:to-cyan-600 transform hover:scale-[1.02] transition-all duration-200 text-sm md:text-base"
              >
                {currentWordIndex < currentSession.length - 1 ? 'Next Word' : 'Finish Session'}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <button
                  onClick={handleSkip}
                  className="bg-gray-100 text-gray-700 py-2 md:py-3 px-3 md:px-4 rounded-xl font-medium hover:bg-gray-200 transform hover:scale-[1.02] transition-all duration-200 text-sm md:text-base"
                >
                  ⏭️ Skip Word
                </button>
                <button
                  onClick={handleAlreadyKnow}
                  className="bg-green-100 text-green-700 py-2 md:py-3 px-3 md:px-4 rounded-xl font-medium hover:bg-green-200 transform hover:scale-[1.02] transition-all duration-200 text-sm md:text-base"
                >
                  ✅ Already Know
                </button>
              </div>
            )}
          </div>

          {/* Start New Session Button */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
            <button
              onClick={startNewSession}
              className="w-full bg-white border-2 border-indigo-200 text-indigo-600 py-2 md:py-3 px-4 md:px-6 rounded-xl font-medium hover:bg-indigo-50 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 text-sm md:text-base"
            >
              <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
              <span>Start New Practice</span>
            </button>
          </div>
        </div>
      </main>

      {/* Badge Modal */}
      <BadgeModal
        isOpen={showBadgeModal}
        onClose={handleCloseBadgeModal}
        badges={newBadges}
        getRarityColor={getRarityColor}
        getRarityBorder={getRarityBorder}
      />
    </div>
  );
};

export default PracticePage;