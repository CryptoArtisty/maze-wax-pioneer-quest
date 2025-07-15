import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, LightningUser } from '@/types/lightningTypes';
import { lightningService } from '@/services/lightningService';
import { GameAction, GameActionType, lightningGameStateReducer } from '@/reducers/lightningGameStateReducer';
import { toast } from 'sonner';

const initialState: GameState = {
  userId: null,
  isAuthenticated: false,
  lightningUser: null,
  currentPosition: null,
  hasClaimedPlot: false,
  balance: null,
  goldBalance: 0,
  profitLoss: null,
  lastFee: 0,
  lastCollection: 0,
  treasuryBalance: 1000000, // 1M satoshis in treasury
};

interface LightningContextType {
  gameState: GameState;
  login: () => Promise<boolean>;
  logout: () => void;
  buyGold: (satoshisAmount: number) => Promise<boolean>;
  claimPlot: (x: number, y: number) => Promise<boolean>;
  payPlotFee: (fee: number) => Promise<boolean>;
  collectTreasure: (value: number) => Promise<boolean>;
  payMovementFee: (fee: number) => Promise<boolean>;
  resetPlotClaim: () => void;
  clearLastFee: () => void;
}

const LightningContext = createContext<LightningContextType | undefined>(undefined);

interface LightningProviderProps {
  children: ReactNode;
}

export function LightningProvider({ children }: LightningProviderProps) {
  const [gameState, dispatch] = useReducer(lightningGameStateReducer, initialState);

  useEffect(() => {
    // Check if WebLN is available
    if (lightningService.isAvailable()) {
      console.log('WebLN detected');
    } else {
      console.log('WebLN not available - install a Lightning wallet extension');
    }
  }, []);

  const login = async (): Promise<boolean> => {
    try {
      const user = await lightningService.authenticate();
      
      if (user) {
        const balance = await lightningService.getBalance();
        
        dispatch({
          type: GameActionType.LOGIN_SUCCESS,
          userId: user.node.pubkey,
          lightningUser: user,
          balance
        });
        
        toast.success(`Welcome, ${user.node.alias}!`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lightning login error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to connect Lightning wallet");
      return false;
    }
  };

  const logout = (): void => {
    dispatch({ type: GameActionType.LOGOUT });
    toast.info("Disconnected from Lightning wallet");
  };

  const buyGold = async (satoshisAmount: number): Promise<boolean> => {
    try {
      // 1 Satoshi = 1 gold conversion rate (very affordable)
      const goldAmount = satoshisAmount;
      
      const success = await lightningService.spendSatoshis(
        satoshisAmount, 
        `Purchase ${goldAmount} gold`
      );
      
      if (success) {
        dispatch({
          type: GameActionType.BUY_GOLD,
          satoshisAmount,
          goldAmount
        });
        
        toast.success(
          `Purchased ${goldAmount} gold for ${lightningService.formatSatoshis(satoshisAmount)}`
        );
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
      // Edge plots cost 200 gold, inner plots cost 100 gold (very affordable)
      const isEdgePlot = x === 0 || y === 0 || x === 14 || y === 14;
      const cost = isEdgePlot ? 200 : 100;
      
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
      const toTreasury = true; // All fees go to treasury in Lightning version
      
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
    <LightningContext.Provider value={{
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
    </LightningContext.Provider>
  );
}

export function useLightning() {
  const context = useContext(LightningContext);
  if (context === undefined) {
    throw new Error('useLightning must be used within a LightningProvider');
  }
  return context;
}