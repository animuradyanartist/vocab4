import React from 'react';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle: React.FC = () => {
  // For now, just a placeholder component
  // Dark mode functionality would be implemented here
  return (
    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
      <Sun className="w-5 h-5 text-gray-600" />
    </button>
  );
};

export default DarkModeToggle;