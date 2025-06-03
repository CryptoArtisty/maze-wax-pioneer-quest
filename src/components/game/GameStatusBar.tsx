
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { GamePhase } from '@/types/gameTypes';
import { Clock, Timer } from 'lucide-react';

interface GameStatusBarProps {
  gamePhase: GamePhase;
  phaseTime: number;
  roundNumber: number;
}

const GameStatusBar: React.FC<GameStatusBarProps> = ({ 
  gamePhase, 
  phaseTime, 
  roundNumber 
}) => {
  // Calculate progress based on phase
  const getPhaseProgress = () => {
    if (gamePhase === 'claim') {
      const maxTime = 20; // 20 seconds for claim phase
      return ((maxTime - phaseTime) / maxTime) * 100;
    } else {
      const maxTime = 300; // 300 seconds for play phase
      return ((maxTime - phaseTime) / maxTime) * 100;
    }
  };

  const getPhaseColor = () => {
    return gamePhase === 'claim' ? 'bg-orange-500' : 'bg-green-500';
  };

  const getStatusText = () => {
    if (gamePhase === 'claim') {
      return 'Plot Claiming Phase';
    }
    return 'Treasure Hunt Phase';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[rgba(0,0,0,0.8)] border-2 border-gold rounded-lg p-4 mx-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {gamePhase === 'claim' ? (
            <Timer className="text-orange-400" size={20} />
          ) : (
            <Clock className="text-green-400" size={20} />
          )}
          <span className="text-gold font-bold">{getStatusText()}</span>
          <span className="text-gold/70">- Round {roundNumber}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
          gamePhase === 'claim' ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'
        }`}>
          {formatTime(phaseTime)}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gold/70">
          <span>Progress</span>
          <span>{Math.round(getPhaseProgress())}%</span>
        </div>
        <Progress 
          value={getPhaseProgress()} 
          className="h-3 bg-gray-700"
        />
      </div>
      
      <div className="mt-3 text-xs text-gold/60 text-center">
        {gamePhase === 'claim' ? (
          "Tap any cell to claim your plot for this round"
        ) : (
          "Navigate the maze and collect crypto treasures!"
        )}
      </div>
    </div>
  );
};

export default GameStatusBar;
