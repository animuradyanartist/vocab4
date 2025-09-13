import React from 'react';

interface WordVideoPlayerProps {
  word: string;
}

const WordVideoPlayer: React.FC<WordVideoPlayerProps> = ({ word }) => {
  if (!word) return null;

  const query = encodeURIComponent(`${word} in a sentence`);
  const videoSrc = `https://www.youtube.com/embed?listType=search&list=${query}`;

  return (
    <div className="mt-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        🎬 Example usage of "{word}"
      </h3>
      <iframe
        title={`YouTube video using the word ${word}`}
        width="100%"
        height="300"
        src={videoSrc}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-xl shadow-lg"
      />
    </div>
  );
};

export default WordVideoPlayer;