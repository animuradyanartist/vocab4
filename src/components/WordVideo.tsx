import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// ✅ Read the key from env (Bolt.new + Netlify)
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;

interface WordVideoProps {
  word: string;
}

const WordVideo: React.FC<WordVideoProps> = ({ word }) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!word) return;

    const searchYouTube = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!YOUTUBE_API_KEY) {
          throw new Error('Missing VITE_YOUTUBE_API_KEY');
        }

        const query = encodeURIComponent(`${word} English`);
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${YOUTUBE_API_KEY}&maxResults=1&type=video`
        );

        if (!res.ok) throw new Error('Failed to fetch YouTube video');

        const data = await res.json();
        const first = data.items?.[0]?.id?.videoId;

        if (first) setVideoId(first);
        else setError('No video found');
      } catch (err) {
        console.error('YouTube API error:', err);
        setError(
          YOUTUBE_API_KEY
            ? 'Failed to load video'
            : 'YouTube API key is missing. Ask the admin to set VITE_YOUTUBE_API_KEY.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    searchYouTube();
  }, [word]);

  if (isLoading) {
    return (
      <div className="mt-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🎬 Example for "{word}"
        </h3>
        <div className="flex items-center justify-center py-8 bg-gray-50 rounded-xl">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mr-3" />
          <span className="text-gray-600">Loading video for "{word}"...</span>
        </div>
      </div>
    );
  }

  if (error || !videoId) {
    return (
      <div className="mt-5">
        <h3 className="text-lg font-semibold text
 };
 
 export default WordVideo;
    )
  }
}