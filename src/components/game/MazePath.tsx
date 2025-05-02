
import React from 'react';
import { toast } from 'sonner';

interface MazePathProps {
  setHintPaths: (paths: Array<Array<[number, number]>>) => void;
}

const MazePath: React.FC<MazePathProps> = ({ setHintPaths }) => {
  // Show hint paths for a few seconds
  const showHint = () => {
    // Implement pathfinding logic here
    toast("Hint shown for 3 seconds");
    
    // Clear hint paths after 3 seconds
    setTimeout(() => {
      setHintPaths([]);
    }, 3000);
  };

  return (
    <button 
      onClick={showHint}
      className="mt-2 text-sm text-blue-400 hover:text-blue-600 underline"
    >
      Show path hint
    </button>
  );
};

export default MazePath;
