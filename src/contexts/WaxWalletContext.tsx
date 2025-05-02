import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { GameState, WalletType } from '@/types/waxTypes';
import { toast } from 'sonner';
import { gameStateReducer, initialGameState, GameAction } from '@/reducers/gameStateReducer';
import { useWaxWalletActions } from '@/hooks/useWaxWalletActions';
import { useGameStateManager } from '@/hooks/useGameStateManager';

interface WaxWalletContextType {
  gameState: GameState;
  login: (walletType: WalletType) => Promise<boolean>;
  logout: () => Promise<void>;
  claimPlot: (x: number, y: number) => Promise<boolean>;
  payPlotFee: (fee: number, ownerAccount: string | null) => Promise<boolean>;
  collectTreasure: (value: number) => Promise<boolean>;
  resetPlotClaim: () => void;
  buyGold: (waxAmount: number) => Promise<boolean>;
  payMovementFee: (fee: number, ownerAccount: string | null) => Promise<boolean>;
}

const WaxWalletContext = createContext<WaxWalletContextType | undefined>(undefined);

export const WaxWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameStateReducer, initialGameState);
  const {
    login,
    logout,
    claimPlot,
    payPlotFee,
    collectTreasure,
    resetPlotClaim,
    buyGold,
    clearLastFee,
    payMovementFee
  } = useWaxWalletActions(dispatch);

  // Manage state persistence and side effects
  useGameStateManager(gameState, clearLastFee);

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('pyrameme-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        // We need to manually apply the session data since we don't want to expose 
        // this action outside our context provider
        if (session.userId && session.isAuthenticated) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            userId: session.userId,
            walletType: session.walletType,
            balance: session.balance
          } as GameAction);
          
          // Manually update gold balance and profit/loss
          if (session.goldBalance) {
            // We could create a new action type for this, but for simplicity
            // we're just dispatching existing actions
            dispatch({
              type: 'COLLECT_TREASURE',
              value: session.goldBalance - initialGameState.goldBalance
            } as GameAction);
          }
          
          if (session.profitLoss) {
            // Adjust the profit/loss state by dispatching appropriate actions
            if (session.profitLoss.profit > 0) {
              dispatch({
                type: 'COLLECT_TREASURE',
                value: 0 // Just to trigger the state update
              } as GameAction);
            }
            
            if (session.profitLoss.loss > 0) {
              dispatch({
                type: 'PAY_PLOT_FEE',
                fee: 0 // Just to trigger the state update
              } as GameAction);
            }
          }
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem('pyrameme-session');
      }
    }
  }, []);

  const checkBalance = (requiredGold: number): boolean => {
    if (!gameState.isAuthenticated) {
      toast.error("Please login first");
      return false;
    }
    
    if (gameState.goldBalance < requiredGold) {
      toast.error(`Insufficient gold! You need ${requiredGold} gold.`);
      return false;
    }
    
    return true;
  };

  // Wrapper for claimPlot that does balance checking
  const handleClaimPlot = async (x: number, y: number): Promise<boolean> => {
    const isEdgePlot = x === 0 || y === 0 || x === 14 || y === 14;
    const cost = isEdgePlot ? 2000 : 1000;
    
    if (!checkBalance(cost)) {
      return false;
    }
    
    return claimPlot(x, y);
  };
  
  // Wrapper for payPlotFee that does balance checking
  const handlePayPlotFee = async (fee: number, ownerAccount: string | null): Promise<boolean> => {
    if (!checkBalance(fee)) {
      return false;
    }
    
    return payPlotFee(fee, ownerAccount);
  };
  
  // Wrapper for payMovementFee that does balance checking
  const handlePayMovementFee = async (fee: number, ownerAccount: string | null): Promise<boolean> => {
    if (!checkBalance(fee)) {
      return false;
    }
    
    return payMovementFee(fee, ownerAccount);
  };
  
  // Wrapper for buyGold that does balance checking
  const handleBuyGold = async (waxAmount: number): Promise<boolean> => {
    if (!gameState.isAuthenticated) {
      toast.error("Please login first");
      return false;
    }
    
    // Check if user has enough balance
    if (gameState.balance && parseFloat(gameState.balance.waxp) < waxAmount) {
      toast.error(`Insufficient WAXP! You need ${waxAmount} WAXP to buy gold.`);
      return false;
    }
    
    return buyGold(waxAmount);
  };

  return (
    <WaxWalletContext.Provider value={{ 
      gameState, 
      login, 
      logout, 
      claimPlot: handleClaimPlot,
      payPlotFee: handlePayPlotFee,
      collectTreasure,
      resetPlotClaim,
      buyGold: handleBuyGold,
      payMovementFee: handlePayMovementFee
    }}>
      {children}
    </WaxWalletContext.Provider>
  );
};

export const useWaxWallet = (): WaxWalletContextType => {
  const context = useContext(WaxWalletContext);
  if (context === undefined) {
    throw new Error('useWaxWallet must be used within a WaxWalletProvider');
  }
  return context;
};
