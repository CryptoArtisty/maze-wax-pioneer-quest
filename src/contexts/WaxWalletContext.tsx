
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { WalletType, WaxUser, GameState, WaxBalance } from '@/types/waxTypes';
import { waxService } from '@/services/waxService';
import { toast } from 'sonner';

interface WaxWalletContextType {
  gameState: GameState;
  login: (walletType: WalletType) => Promise<boolean>;
  logout: () => Promise<void>;
  claimPlot: (x: number, y: number) => Promise<boolean>;
  payPlotFee: (fee: number, ownerAccount: string | null) => Promise<boolean>;
  collectTreasure: (value: number) => Promise<boolean>;
  resetPlotClaim: () => void;
  buyGold: (waxAmount: number) => Promise<boolean>;
}

const WaxWalletContext = createContext<WaxWalletContextType | undefined>(undefined);

export const WaxWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    userId: null,
    isAuthenticated: false,
    walletType: null,
    currentPosition: null,
    hasClaimedPlot: false,
    balance: null,
    goldBalance: 10000, // Starting gold balance
    profitLoss: {
      profit: 0,
      loss: 0
    }
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('pyrameme-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setGameState(prevState => ({
          ...prevState,
          ...session
        }));
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem('pyrameme-session');
      }
    }
  }, []);

  // Save session when it changes
  useEffect(() => {
    if (gameState.isAuthenticated && gameState.userId) {
      const sessionData = {
        userId: gameState.userId,
        isAuthenticated: gameState.isAuthenticated,
        walletType: gameState.walletType,
        currentPosition: gameState.currentPosition,
        hasClaimedPlot: gameState.hasClaimedPlot,
        goldBalance: gameState.goldBalance,
        profitLoss: gameState.profitLoss
      };
      localStorage.setItem('pyrameme-session', JSON.stringify(sessionData));
    } else {
      localStorage.removeItem('pyrameme-session');
    }
  }, [gameState]);

  const login = async (walletType: WalletType): Promise<boolean> => {
    let user: WaxUser | null = null;
    
    try {
      if (walletType === WalletType.CLOUD) {
        user = await waxService.loginWithCloudWallet();
      } else if (walletType === WalletType.ANCHOR) {
        user = await waxService.loginWithAnchorWallet();
      }

      if (user) {
        const balance = await waxService.getBalance(user.account);
        
        setGameState({
          userId: user.account,
          isAuthenticated: true,
          walletType,
          currentPosition: null,
          hasClaimedPlot: false,
          balance,
          goldBalance: 10000, // Starting gold
          profitLoss: {
            profit: 0,
            loss: 0
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login. Please try again.");
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await waxService.logout();
    setGameState({
      userId: null,
      isAuthenticated: false,
      walletType: null,
      currentPosition: null,
      hasClaimedPlot: false,
      balance: null,
      goldBalance: 0,
      profitLoss: {
        profit: 0,
        loss: 0
      }
    });
  };

  // New function to buy gold with WAXP
  const buyGold = async (waxAmount: number): Promise<boolean> => {
    if (!gameState.isAuthenticated || !gameState.userId) {
      toast.error("Please login first");
      return false;
    }

    try {
      // Check if user has enough balance
      if (gameState.balance && parseFloat(gameState.balance.waxp) < waxAmount) {
        toast.error(`Insufficient WAXP! You need ${waxAmount} WAXP to buy gold.`);
        return false;
      }

      // 1 WAXP = 1000 gold conversion rate
      const goldAmount = waxAmount * 1000;
      
      const result = await waxService.buyGold(gameState.userId, waxAmount);
      
      if (result) {
        // Update the game state
        setGameState(prev => ({
          ...prev,
          balance: prev.balance ? {
            ...prev.balance,
            waxp: (parseFloat(prev.balance.waxp) - waxAmount).toFixed(4)
          } : null,
          goldBalance: prev.goldBalance + goldAmount
        }));
        
        toast.success(`Purchased ${goldAmount} gold for ${waxAmount} WAXP`);
      }
      
      return result;
    } catch (error) {
      console.error("Error buying gold:", error);
      toast.error("Failed to buy gold");
      return false;
    }
  };

  const claimPlot = async (x: number, y: number): Promise<boolean> => {
    if (!gameState.isAuthenticated || !gameState.userId) {
      toast.error("Please login first");
      return false;
    }

    try {
      // Edge plots cost 2000 gold, inner plots cost 1000 gold
      const isEdgePlot = x === 0 || y === 0 || x === 14 || y === 14;
      const cost = isEdgePlot ? 2000 : 1000;
      
      // Check if user has enough gold balance
      if (gameState.goldBalance < cost) {
        toast.error(`Insufficient gold! You need ${cost} gold to claim this plot.`);
        return false;
      }
      
      const result = await waxService.claimPlot(gameState.userId, x, y);
      
      if (result) {
        // Update the game state
        setGameState(prev => ({
          ...prev,
          currentPosition: { x, y },
          hasClaimedPlot: true,
          goldBalance: prev.goldBalance - cost,
          profitLoss: {
            ...prev.profitLoss!,
            loss: prev.profitLoss!.loss + cost
          }
        }));
        
        toast.success(`Plot claimed at position [${x}, ${y}] for ${cost} gold`);
      }
      
      return result;
    } catch (error) {
      console.error("Error claiming plot:", error);
      toast.error("Failed to claim plot");
      return false;
    }
  };
  
  const payPlotFee = async (fee: number, ownerAccount: string | null): Promise<boolean> => {
    if (!gameState.isAuthenticated || !gameState.userId) {
      toast.error("Please login first");
      return false;
    }
    
    try {
      // Check if user has enough gold balance
      if (gameState.goldBalance < fee) {
        toast.error(`Insufficient gold! You need ${fee} gold to pay the plot fee.`);
        return false;
      }
      
      const result = await waxService.payPlotFee(gameState.userId, fee, ownerAccount);
      
      if (result) {
        // Update the game state
        setGameState(prev => ({
          ...prev,
          goldBalance: prev.goldBalance - fee,
          profitLoss: {
            ...prev.profitLoss!,
            loss: prev.profitLoss!.loss + fee
          }
        }));
      }
      
      return result;
    } catch (error) {
      console.error("Error paying plot fee:", error);
      toast.error("Failed to pay plot fee");
      return false;
    }
  };
  
  const collectTreasure = async (value: number): Promise<boolean> => {
    if (!gameState.isAuthenticated || !gameState.userId) {
      return false;
    }
    
    try {
      const result = await waxService.collectTreasure(gameState.userId, value);
      
      if (result) {
        // Update the game state with gold rather than WAXP
        setGameState(prev => ({
          ...prev,
          goldBalance: prev.goldBalance + value,
          profitLoss: {
            ...prev.profitLoss!,
            profit: prev.profitLoss!.profit + value
          }
        }));
      }
      
      return result;
    } catch (error) {
      console.error("Error collecting treasure:", error);
      return false;
    }
  };

  // Function to reset plot claim status
  const resetPlotClaim = () => {
    setGameState(prev => ({
      ...prev,
      currentPosition: null,
      hasClaimedPlot: false
    }));
    
    toast.info("All plots have been relinquished for the next round!");
  };

  return (
    <WaxWalletContext.Provider value={{ 
      gameState, 
      login, 
      logout, 
      claimPlot,
      payPlotFee,
      collectTreasure,
      resetPlotClaim,
      buyGold
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
