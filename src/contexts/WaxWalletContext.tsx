import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { WalletType, WaxUser, GameState, WaxBalance } from '@/types/waxTypes';
import { waxService } from '@/services/waxService';
import { toast } from 'sonner';

interface WaxWalletContextType {
  gameState: GameState;
  login: (walletType: WalletType) => Promise<boolean>;
  logout: () => Promise<void>;
  claimCell: (x: number, y: number) => Promise<boolean>;
  payParkingFee: (fee: number) => Promise<boolean>;
  collectTreasure: (value: number) => Promise<boolean>;
  resetCellClaim: () => void;
}

const WaxWalletContext = createContext<WaxWalletContextType | undefined>(undefined);

export const WaxWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    userId: null,
    isAuthenticated: false,
    walletType: null,
    currentPosition: null,
    hasClaimedCell: false,
    balance: null,
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
        hasClaimedCell: gameState.hasClaimedCell,
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
          hasClaimedCell: false,
          balance,
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
      hasClaimedCell: false,
      balance: null,
      profitLoss: {
        profit: 0,
        loss: 0
      }
    });
  };

  const claimCell = async (x: number, y: number): Promise<boolean> => {
    if (!gameState.isAuthenticated || !gameState.userId) {
      toast.error("Please login first");
      return false;
    }

    try {
      const cost = (x === 0 && y === 0) || (x === 14 && y === 14) ? 20 : 5; // Corner cells cost more
      
      // Check if user has enough balance
      if (gameState.balance && parseFloat(gameState.balance.waxp) < cost) {
        toast.error(`Insufficient funds! You need ${cost} WAXP to claim this cell.`);
        return false;
      }
      
      const result = await waxService.claimCell(gameState.userId, x, y);
      
      if (result) {
        // Update the game state
        setGameState(prev => ({
          ...prev,
          currentPosition: { x, y },
          hasClaimedCell: true,
          balance: prev.balance ? {
            ...prev.balance,
            waxp: (parseFloat(prev.balance.waxp) - cost).toFixed(4)
          } : null,
          profitLoss: {
            ...prev.profitLoss!,
            loss: prev.profitLoss!.loss + cost
          }
        }));
        
        toast.success(`Cell claimed at position [${x}, ${y}] for ${cost} WAXP`);
      }
      
      return result;
    } catch (error) {
      console.error("Error claiming cell:", error);
      toast.error("Failed to claim cell");
      return false;
    }
  };
  
  const payParkingFee = async (fee: number): Promise<boolean> => {
    if (!gameState.isAuthenticated || !gameState.userId) {
      toast.error("Please login first");
      return false;
    }
    
    try {
      // Check if user has enough balance
      if (gameState.balance && parseFloat(gameState.balance.waxp) < fee) {
        toast.error(`Insufficient funds! You need ${fee} WAXP to pay the parking fee.`);
        return false;
      }
      
      const result = await waxService.payParkingFee(gameState.userId, fee);
      
      if (result) {
        // Update the game state
        setGameState(prev => ({
          ...prev,
          balance: prev.balance ? {
            ...prev.balance,
            waxp: (parseFloat(prev.balance.waxp) - fee).toFixed(4)
          } : null,
          profitLoss: {
            ...prev.profitLoss!,
            loss: prev.profitLoss!.loss + fee
          }
        }));
      }
      
      return result;
    } catch (error) {
      console.error("Error paying parking fee:", error);
      toast.error("Failed to pay parking fee");
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
        // Update the game state
        setGameState(prev => ({
          ...prev,
          balance: prev.balance ? {
            ...prev.balance,
            waxp: (parseFloat(prev.balance.waxp) + value).toFixed(4)
          } : null,
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

  // New function to reset cell claim status
  const resetCellClaim = () => {
    setGameState(prev => ({
      ...prev,
      currentPosition: null,
      hasClaimedCell: false
    }));
    
    toast.info("All cells have been relinquished for the next round!");
  };

  return (
    <WaxWalletContext.Provider value={{ 
      gameState, 
      login, 
      logout, 
      claimCell,
      payParkingFee,
      collectTreasure,
      resetCellClaim
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
