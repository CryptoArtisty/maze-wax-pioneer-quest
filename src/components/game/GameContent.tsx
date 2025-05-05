
import React from 'react';
import MazeGrid from '@/components/MazeGrid';
import { GamePhase } from '@/types/gameTypes';

interface GameContentProps {
  gamePhase: GamePhase;
  onScoreChange: (score: number) => void;
  onReachExit?: (reached: boolean) => void;
}

const GameContent: React.FC<GameContentProps> = ({ gamePhase, onScoreChange, onReachExit }) => {
  const rows = 15;
  const cols = 15;

  return (
    <main className="container mx-auto mt-4 mb-24 px-2">
      <MazeGrid 
        rows={rows} 
        cols={cols} 
        gamePhase={gamePhase} 
        onScoreChange={onScoreChange}
        onReachExit={onReachExit}
      />
    </main>
  );
};

export default GameContent;
