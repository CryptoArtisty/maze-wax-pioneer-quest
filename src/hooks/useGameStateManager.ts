
import { useEffect } from 'react';
import { GameState } from '@/types/waxTypes';

export function useGameStateManager(gameState: GameState, clearLastFee: () => void) {
  // Save session when it changes
  useEffect(() => {
    if (gameState.isAuthenticated && gameState.userId) {
      const sessionData = {
        userId: gameState.userId,
        isAuthenticated: gameState.isAuthenticated,
        walletType: gameState.walletType,
        goldBalance: gameState.goldBalance,
        profitLoss: gameState.profitLoss,
        balance: gameState.balance
        // Don't save currentPosition, hasClaimedPlot, or lastFee
      };
      localStorage.setItem('pyrameme-session', JSON.stringify(sessionData));
    } else {
      localStorage.removeItem('pyrameme-session');
    }
  }, [gameState]);

  // Clear lastFee after a delay
  useEffect(() => {
    if (gameState.lastFee > 0) {
      const timer = setTimeout(() => {
        clearLastFee();
      }, 3000); // Show fee for 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [gameState.lastFee, clearLastFee]);

  // Return nothing, this hook is just for side effects
}
