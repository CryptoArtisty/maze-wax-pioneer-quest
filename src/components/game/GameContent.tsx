
import React from 'react';
import MazeGrid from '@/components/MazeGrid';
import { GamePhase } from '@/types/gameTypes';

interface GameContentProps {
  gamePhase: GamePhase;
  onScoreChange: (score: number) => void;
}

const GameContent: React.FC<GameContentProps> = ({ gamePhase, onScoreChange }) => {
  return (
    <main className="container mx-auto px-2 py-4 max-w-4xl">
      {/* Centered container with mobile-friendly padding */}
      <div className="flex justify-center">
        <MazeGrid 
          rows={15} 
          cols={15} 
          gamePhase={gamePhase}
          onScoreChange={onScoreChange}
        />
      </div>
    </main>
  );
};

export default GameContent;
