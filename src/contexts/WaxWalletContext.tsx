
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { WalletType, WaxUser, GameState, WaxBalance } from '@/types/waxTypes';
import { waxService } from '@/services/waxService';
import { toast } from 'sonner';

interface WaxWalletContextType {
  gameState: GameState;
  login: (walletType: WalletType) => Promise<boolean>;
  logout: () => Promise<void>;
  claimCell: (x: number, y: number) => Promise<boolean>;
}

const WaxWalletContext = createContext<WaxWalletContextType | undefined>(undefined);

export const WaxWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    userId: null,
    isAuthenticated: false,
    walletType: null,
    currentPosition: null,
    hasClaimedCell: false,
    balance: null
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
        hasClaimedCell: gameState.hasClaimedCell
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
          hasClaimedCell: false, // We'll check this from the backend in a real implementation
          balance
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
      balance: null
    });
  };

  const claimCell = async (x: number, y: number): Promise<boolean> => {
    if (!gameState.isAuthenticated || !gameState.userId) {
      toast.error("Please login first");
      return false;
    }

    try {
      const result = await waxService.claimCell(gameState.userId, x, y);
      
      if (result) {
        setGameState(prev => ({
          ...prev,
          currentPosition: { x, y },
          hasClaimedCell: true
        }));
      }
      
      return result;
    } catch (error) {
      console.error("Error claiming cell:", error);
      toast.error("Failed to claim cell");
      return false;
    }
  };

  return (
    <WaxWalletContext.Provider value={{ gameState, login, logout, claimCell }}>
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
