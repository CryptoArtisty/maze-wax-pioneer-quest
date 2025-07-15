import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, TelegramUser } from '@/types/telegramTypes';
import { telegramService } from '@/services/telegramService';
import { GameAction, GameActionType, telegramGameStateReducer } from '@/reducers/telegramGameStateReducer';
import { toast } from 'sonner';

const initialState: GameState = {
  userId: null,
  isAuthenticated: false,
  telegramUser: null,
  currentPosition: null,
  hasClaimedPlot: false,
  balance: null,
  goldBalance: 0,
  profitLoss: null,
  lastFee: 0,
  lastCollection: 0,
  treasuryBalance: 10000,
};

interface TelegramContextType {
  gameState: GameState;
  login: () => Promise<boolean>;
  logout: () => void;
  buyGold: (starsAmount: number) => Promise<boolean>;
  claimPlot: (x: number, y: number) => Promise<boolean>;
  payPlotFee: (fee: number) => Promise<boolean>;
  collectTreasure: (value: number) => Promise<boolean>;
  payMovementFee: (fee: number) => Promise<boolean>;
  resetPlotClaim: () => void;
  clearLastFee: () => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [gameState, dispatch] = useReducer(telegramGameStateReducer, initialState);

  useEffect(() => {
    // Initialize Telegram WebApp
    const initTelegram = async () => {
      try {
        if (telegramService.isAvailable()) {
          await telegramService.initialize();
          telegramService.setHeaderColor('bg_color');
          telegramService.setBackgroundColor('bg_color');
        }
      } catch (error) {
        console.error('Failed to initialize Telegram:', error);
      }
    };

    initTelegram();
  }, []);

  const login = async (): Promise<boolean> => {
    try {
      const user = await telegramService.authenticate();
      
      if (user) {
        const balance = await telegramService.getStarsBalance(user.id);
        
        dispatch({
          type: GameActionType.LOGIN_SUCCESS,
          userId: user.id.toString(),
          telegramUser: user,
          balance
        });
        
        toast.success(`Welcome, ${user.first_name}!`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to authenticate with Telegram");
      return false;
    }
  };

  const logout = (): void => {
    dispatch({ type: GameActionType.LOGOUT });
    toast.info("Logged out successfully");
  };

  const buyGold = async (starsAmount: number): Promise<boolean> => {
    try {
      // 1 Star = 100 gold conversion rate
      const goldAmount = starsAmount * 100;
      
      const success = await telegramService.spendStars(starsAmount, `Purchase ${goldAmount} gold`);
      
      if (success) {
        dispatch({
          type: GameActionType.BUY_GOLD,
          starsAmount,
          goldAmount
        });
        
        toast.success(`Purchased ${goldAmount} gold for ${starsAmount} stars`);
      }
      
      return success;
    } catch (error) {
      console.error("Error buying gold:", error);
      toast.error("Failed to buy gold");
      return false;
    }
  };

  const claimPlot = async (x: number, y: number): Promise<boolean> => {
    try {
      // Edge plots cost 20 gold, inner plots cost 10 gold
      const isEdgePlot = x === 0 || y === 0 || x === 14 || y === 14;
      const cost = isEdgePlot ? 20 : 10;
      
      dispatch({
        type: GameActionType.CLAIM_PLOT,
        x,
        y,
        cost
      });
      
      toast.success(`Plot claimed at position [${x}, ${y}] for ${cost} gold`);
      return true;
    } catch (error) {
      console.error("Error claiming plot:", error);
      toast.error("Failed to claim plot");
      return false;
    }
  };

  const payPlotFee = async (fee: number): Promise<boolean> => {
    try {
      dispatch({
        type: GameActionType.PAY_PLOT_FEE,
        fee
      });
      return true;
    } catch (error) {
      console.error("Error paying plot fee:", error);
      toast.error("Failed to pay plot fee");
      return false;
    }
  };

  const collectTreasure = async (value: number): Promise<boolean> => {
    try {
      dispatch({
        type: GameActionType.COLLECT_TREASURE,
        value
      });
      return true;
    } catch (error) {
      console.error("Error collecting treasure:", error);
      return false;
    }
  };

  const payMovementFee = async (fee: number): Promise<boolean> => {
    try {
      const toTreasury = true; // All fees go to treasury in Telegram version
      
      dispatch({
        type: GameActionType.PAY_MOVEMENT_FEE,
        fee,
        toTreasury
      });
      return true;
    } catch (error) {
      console.error("Error paying movement fee:", error);
      toast.error("Failed to pay movement fee");
      return false;
    }
  };

  const resetPlotClaim = (): void => {
    dispatch({ type: GameActionType.RESET_PLOT_CLAIM });
    toast.info("All plots have been relinquished for the next round!");
  };

  const clearLastFee = (): void => {
    dispatch({ type: GameActionType.CLEAR_FEE });
  };

  return (
    <TelegramContext.Provider value={{
      gameState,
      login,
      logout,
      buyGold,
      claimPlot,
      payPlotFee,
      collectTreasure,
      payMovementFee,
      resetPlotClaim,
      clearLastFee
    }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}