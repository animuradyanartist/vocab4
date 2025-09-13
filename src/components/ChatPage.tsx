import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, AlertCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ChatPageProps {
  username: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface Word {
  id: string;
  english: string;
  armenian: string;
  dateAdded: Date;
  isLearned?: boolean;
}

const BOTPRESS_CONFIG = {
  BOT_ID: "your-real-bot-id", // e.g., "abc123-xyz456"
  PERSONAL_ACCESS_TOKEN: "your-real-personal-access-token", // starts with bp_api_
  USER_ID: "user_001", // can be dynamic if needed
};

const TOPICS = [
  { id: 'general', label: '💬 General Chat', description: 'Open conversation' },
  { id: 'travel', label: '✈️ Travel', description: 'Airport, hotel, directions' },
  { id: 'shopping', label: '🛍️ Shopping', description: 'Store, prices, buying' },
  { id: 'restaurant', label: '🍽️ Restaurant', description: 'Ordering food, dining' },
  { id: 'job_interview', label: '💼 Job Interview', description: 'Professional conversation' },
  { id: 'daily_life', label: '🏠 Daily Life', description: 'Routine, family, hobbies' }
];

const ChatPage: React.FC<ChatPageProps> = ({ username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('general');
  const [words] = useLocalStorage<Word[]>('vocabulary-words', []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user's vocabulary list for context
  const vocabList = words.map(word => word.english);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'bot',
      text: `Hello ${username}! I'm your English conversation partner. I can help you practice using your vocabulary words in real conversations. Choose a topic below and let's start chatting!`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [username]);

  async function sendToBotpress(message: string, vocabList: string[] = [], topic: string = ""): Promise<string[]> {
    const { BOT_ID, PERSONAL_ACCESS_TOKEN, USER_ID } = BOTPRESS_CONFIG;

    try {
      const res = await fetch(`https://api.botpress.cloud/v1/bots/${BOT_ID}/converse/${USER_ID}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "text",
          text: message,
          variables: {
            vocabList,
            topic
          }
        })
      });

      if (!res.ok) throw new Error(`Botpress API error: ${res.statusText}`);

      const data = await res.json();
      return data.responses
        .filter((r: any) => r.type === "text")
        .map((r: any) => r.text);
    } catch (error) {
      console.error("Error talking to Botpress:", error);
      return ["⚠️ Failed to connect to the chatbot. Please try again later."];
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const botResponses = await sendToBotpress(userMessage.text, vocabList.slice(0, 10), selectedTopic);
      
      // Add bot responses as separate messages
      const botMessages: Message[] = botResponses.map((text, index) => ({
        id: `${Date.now()}-bot-${index}`,
        type: 'bot',
        text,
        timestamp: new Date()
      }));

      setMessages(prev => [...prev, ...botMessages]);
    } catch (error) {
      // Error handling is now done inside sendToBotpress function
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedTopicInfo = TOPICS.find(topic => topic.id === selectedTopic);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Conversation Practice</h1>
                <p className="text-sm text-gray-600">
                  Topic: {selectedTopicInfo?.label} • {vocabList.length} words available
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Topic Selection */}
      <div className="max-w-4xl mx-auto w-full px-4 py-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose a conversation topic:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  selectedTopic === topic.id
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{topic.label}</div>
                <div className={`text-xs mt-1 ${
                  selectedTopic === topic.id ? 'text-indigo-100' : 'text-gray-500'
                }`}>
                  {topic.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 pb-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 h-96 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-indigo-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl max-w-xs">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={1}
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration Notice */}
      {BOTPRESS_CONFIG.PERSONAL_ACCESS_TOKEN === "your-real-personal-access-token" && (
        <div className="max-w-4xl mx-auto w-full px-4 pb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">API Configuration Required</h4>
              <p className="text-sm text-yellow-700">
                Please update the BOT_ID and PERSONAL_ACCESS_TOKEN in the BOTPRESS_CONFIG to connect to your Botpress bot.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;