
import React, { useState, useEffect } from 'react';
import { globalTimer } from '@/services/globalTimerService';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { Clock, Users } from 'lucide-react';

const GlobalGameStatus: React.FC = () => {
  const [globalState, setGlobalState] = useState(globalTimer.getCurrentGameState());
  const { gameState } = useWaxWallet();

  useEffect(() => {
    const updateGlobalState = () => {
      setGlobalState(globalTimer.getCurrentGameState());
    };

    // Update every second
    const interval = setInterval(updateGlobalState, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't show if player is already participating in current round
  if (gameState.currentPosition && gameState.hasClaimedPlot) {
    return null;
  }

  return (
    <div className="bg-[rgba(0,0,0,0.9)] border-2 border-blue-400 rounded-lg p-4 mx-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="text-blue-400" size={20} />
          <span className="text-blue-400 font-bold">Global Game Status</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="text-blue-400" size={16} />
          <span className="text-blue-400 text-sm">Round {globalState.roundNumber}</span>
        </div>
      </div>
      
      {globalState.canJoinNow ? (
        <div className="text-center">
          <div className="text-green-400 font-bold mb-1">
            🟢 CLAIM PHASE ACTIVE
          </div>
          <div className="text-green-300 text-sm">
            Claim your plot now! {formatTime(globalState.timeRemaining)} remaining
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-orange-400 font-bold mb-1">
            🔴 PLAY PHASE IN PROGRESS
          </div>
          <div className="text-orange-300 text-sm">
            Round active for {formatTime(globalState.timeRemaining)} more
          </div>
          <div className="text-blue-300 text-xs mt-1">
            Next claiming opportunity in {formatTime(globalState.timeRemaining)}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalGameStatus;
