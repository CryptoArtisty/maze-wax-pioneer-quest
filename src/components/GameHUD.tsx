
import React from 'react';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { GamePhase } from '@/types/gameTypes';

interface GameHUDProps {
  score: number;
  phaseTime: number;
  gamePhase: GamePhase;
  roundNumber?: number;
}

const GameHUD: React.FC<GameHUDProps> = ({ score, phaseTime, gamePhase, roundNumber = 1 }) => {
  const { gameState } = useWaxWallet();
  const highScore = parseInt(localStorage.getItem('pyrameme-high-score') || '0');
  
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
      
      {gameState.balance && (
        <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-gold rounded-lg min-w-[120px] text-lg overflow-hidden text-ellipsis whitespace-nowrap">
          <span id="wallet">Wallet: {gameState.balance.waxp} WAXP</span>
        </div>
      )}
      
      <div 
        className={`card p-3 border-2 border-gold rounded-lg min-w-[120px] text-lg ${
          gamePhase === 'claim' ? 'bg-[#FF8C00]/70' : 'bg-[#008000]/70'
        }`}
      >
        <span id="phaseTimerStrip">
          Phase: {gamePhase === 'claim' ? 'Claim' : 'Play'} ({phaseTime}s)
        </span>
      </div>
      
      {gameState.profitLoss && (
        <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-gold rounded-lg min-w-[120px] text-lg">
          <span id="profitLoss">
            Profit/Loss: {gameState.profitLoss.profit - gameState.profitLoss.loss} WAXP
          </span>
        </div>
      )}
      
      <div className="card bg-[rgba(0,0,0,0.7)] p-3 border-2 border-gold rounded-lg min-w-[150px] text-lg">
        <span id="roundInfo">
          {gameState.hasClaimedCell ? "Cell claimed" : "No cell claimed yet"}
        </span>
      </div>
    </div>
  );
};

export default GameHUD;
