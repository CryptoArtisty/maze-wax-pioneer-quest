import React, { useEffect, useState } from 'react';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { GamePhase } from '@/types/gameTypes';
import { Coins } from 'lucide-react';

interface GameHUDProps {
  score: number;
  phaseTime: number;
  gamePhase: GamePhase;
  roundNumber?: number;
}

const GameHUD: React.FC<GameHUDProps> = ({ score, phaseTime, gamePhase, roundNumber = 1 }) => {
  const { gameState } = useWaxWallet();
  const highScore = parseInt(localStorage.getItem('pyrameme-high-score') || '0');
  const [showGoldChange, setShowGoldChange] = useState(false);
  const [goldAnimation, setGoldAnimation] = useState<{amount: number, isPositive: boolean} | null>(null);
  
  // Track gold balance changes
  useEffect(() => {
    if (gameState.lastFee > 0) {
      setGoldAnimation({ amount: gameState.lastFee, isPositive: false });
      setShowGoldChange(true);
      const timer = setTimeout(() => setShowGoldChange(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.lastFee]);
  
  // Track gold treasure collection changes
  useEffect(() => {
    if (gameState.lastCollection > 0) {
      setGoldAnimation({ amount: gameState.lastCollection, isPositive: true });
      setShowGoldChange(true);
      const timer = setTimeout(() => setShowGoldChange(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.lastCollection]);
  
  return (
    <div id="hud" className="flex flex-wrap justify-center gap-2 px-4 my-5">
      <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-gold rounded-lg min-w-[120px] text-lg">
        <span id="score">𓃭 Score: {score}</span>
      </div>
      
      <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-gold rounded-lg min-w-[120px] text-lg">
        <span id="highScore">𓀙 High Score: {highScore}</span>
      </div>
      
      <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-gold rounded-lg min-w-[120px] text-lg">
        <span id="roundNumber">Round: {roundNumber}</span>
      </div>
      
      <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-gold rounded-lg min-w-[120px] text-lg overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-1">
        <Coins size={18} className="text-yellow-400" />
        <span id="goldBalance">Gold: {gameState.goldBalance}</span>
        
        {/* Gold change indicator */}
        {showGoldChange && goldAnimation && (
          <span 
            className={`ml-2 font-bold gold-change ${
              goldAnimation.isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {goldAnimation.isPositive ? '+' : '-'}{goldAnimation.amount}
          </span>
        )}
      </div>
      
      <div 
        className={`card p-3 border-2 border-gold rounded-lg min-w-[120px] text-lg ${
          gamePhase === 'claim' ? 'bg-[#FF8C00]/70' : 'bg-[#008000]/70'
        }`}
      >
        <span id="phaseTimerStrip">
          Status: {gamePhase === 'claim' ? 'Claim' : 'Play'} ({phaseTime}s)
        </span>
      </div>
      
      {gameState.profitLoss && (
        <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-gold rounded-lg min-w-[120px] text-lg">
          <span id="profitLoss">
            Profit/Loss: {gameState.profitLoss.profit - gameState.profitLoss.loss} gold
          </span>
        </div>
      )}
      
      <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-gold rounded-lg min-w-[150px] text-lg">
        <span id="roundInfo">
          {gameState.hasClaimedPlot ? "Plot claimed" : "No plot claimed yet"}
        </span>
      </div>
      
      {/* Treasury balance */}
      <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-gold rounded-lg min-w-[150px] text-lg">
        <span id="treasuryBalance">
          Treasury: {gameState.treasuryBalance} gold
        </span>
      </div>
      
      {/* Gold fee indicator */}
      {gameState.lastFee > 0 && (
        <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-red-500 rounded-lg min-w-[120px] text-lg fee-indicator">
          <span id="lastTransaction" className="text-red-400">
            -{gameState.lastFee} gold
          </span>
        </div>
      )}
      
      {/* Gold collection indicator */}
      {gameState.lastCollection > 0 && (
        <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-green-500 rounded-lg min-w-[120px] text-lg collection-indicator">
          <span id="lastCollection" className="text-green-400">
            +{gameState.lastCollection} gold
          </span>
        </div>
      )}
    </div>
  );
};

export default GameHUD;
