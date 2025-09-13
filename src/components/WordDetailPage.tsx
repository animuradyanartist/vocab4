import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Loader2, BookOpen, Clock, Globe, Lightbulb, Play } from 'lucide-react';

interface Word {
  id: string;
  english: string;
  armenian: string;
  dateAdded: Date;
  isLearned?: boolean;
}

interface DictionaryData {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  partOfSpeech?: string;
  definition?: string;
  example?: string;
}

interface WordDetailPageProps {
  word: Word;
  onBack: () => void;
}

const WordDetailPage: React.FC<WordDetailPageProps> = ({ word, onBack }) => {
  const [dictionaryData, setDictionaryData] = useState<DictionaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    fetchDictionaryData();
  }, [word.english]);

  const fetchDictionaryData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.english}`);
      
      if (!response.ok) {
        throw new Error('Dictionary data not found');
      }
      
      const data = await response.json();
      const entry = data[0];
      
      if (entry) {
        const meaning = entry.meanings?.[0];
        const definition = meaning?.definitions?.[0];
        
        setDictionaryData({
          word: entry.word,
          phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
          audioUrl: entry.phonetics?.find((p: any) => p.audio)?.audio,
          partOfSpeech: meaning?.partOfSpeech,
          definition: definition?.definition,
          example: definition?.example
        });
      }
    } catch (err) {
      setError('Could not load dictionary data');
      console.error('Dictionary API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const playPronunciation = (wordText: string) => {
    if (!wordText.trim()) return;
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const playAudioPronunciation = () => {
    if (dictionaryData?.audioUrl) {
      const audio = new Audio(dictionaryData.audioUrl);
      audio.play().catch(err => {
        console.error('Audio playback failed:', err);
        // Fallback to speech synthesis
        playPronunciation(word.english);
      });
    } else {
      playPronunciation(word.english);
    }
  };

  const openYouGlish = () => {
    const youglishUrl = `https://youglish.com/pronounce/${encodeURIComponent(word.english)}/english?`;
    window.open(youglishUrl, '_blank');
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
          <div>
            <h1 className="text-xl font-bold text-gray-800">Word Detail</h1>
            <p className="text-sm text-gray-600">Learn more about this word</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Word Display */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              {word.english}
            </h1>
            <button
              onClick={playAudioPronunciation}
              className="p-3 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200"
              title="Play pronunciation"
            >
              <Volume2 className="w-6 h-6 text-indigo-600" />
            </button>
          </div>
          
          {dictionaryData?.phonetic && (
            <p className="text-lg text-gray-600 mb-2">/{dictionaryData.phonetic}/</p>
          )}
          
          <p className="text-2xl text-indigo-600 font-medium mb-4">
            {word.armenian}
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Added {word.dateAdded.toLocaleDateString()}</span>
            </div>
            {word.isLearned && (
              <div className="flex items-center space-x-1 text-green-600">
                <BookOpen className="w-4 h-4" />
                <span>Learned</span>
              </div>
            )}
          </div>
        </div>

        {/* Dictionary Information */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Globe className="w-6 h-6 text-indigo-500 mr-2" />
            Dictionary Information
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mr-3" />
              <span className="text-gray-600">Loading dictionary data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <button
                onClick={fetchDictionaryData}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : dictionaryData ? (
            <div className="space-y-4">
              {dictionaryData.partOfSpeech && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Part of Speech</h3>
                  <p className="text-indigo-600 font-medium capitalize">{dictionaryData.partOfSpeech}</p>
                </div>
              )}
              
              {dictionaryData.definition && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Definition</h3>
                  <p className="text-gray-800">{dictionaryData.definition}</p>
                </div>
              )}
              
              {dictionaryData.example && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1 flex items-center">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mr-1" />
                    Example
                  </h3>
                  <p className="text-gray-700 italic">"{dictionaryData.example}"</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No dictionary data available</p>
          )}
        </div>

        {/* Video Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Play className="w-6 h-6 text-red-500 mr-2" />
            Video Examples
          </h2>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Watch "{word.english}" in Real Context
            </h3>
            <p className="text-gray-600 mb-6">
              See how native speakers use this word in real videos with YouGlish
            </p>
            <button
              onClick={openYouGlish}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              <span>Open YouGlish</span>
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="pt-4">
          <button
            onClick={onBack}
            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-medium hover:from-indigo-600 hover:to-cyan-600 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to My Words</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default WordDetailPage;