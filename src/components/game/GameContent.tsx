
import React from 'react';
import MazeGrid from '@/components/MazeGrid';
import { GamePhase } from '@/types/gameTypes';

interface GameContentProps {
  gamePhase: GamePhase;
  onScoreChange: (score: number) => void;
}

const GameContent: React.FC<GameContentProps> = ({ gamePhase, onScoreChange }) => {
  return (
    <main className="container mx-auto px-4 py-6">
      <MazeGrid 
        rows={15} 
        cols={15} 
        gamePhase={gamePhase}
        onScoreChange={onScoreChange}
      />
    </main>
  );
};

export default GameContent;
