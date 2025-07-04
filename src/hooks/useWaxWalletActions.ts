import { useCallback } from 'react';
import { WalletType, WaxUser } from '@/types/waxTypes';
import { simpleWalletService } from '@/services/simpleWalletService';
import { toast } from 'sonner';
import { GameAction, GameActionType } from '@/reducers/gameStateReducer';

export function useWaxWalletActions(dispatch: React.Dispatch<GameAction>) {
  const login = useCallback(async (walletType: WalletType): Promise<boolean> => {
    let user: WaxUser | null = null;
    
    try {
      if (walletType === WalletType.CLOUD) {
        user = await simpleWalletService.loginCloud();
      } else if (walletType === WalletType.ANCHOR) {
        user = await simpleWalletService.loginAnchor();
      }

      if (user) {
        const balance = await simpleWalletService.getBalance(user.account);
        
        dispatch({
          type: GameActionType.LOGIN_SUCCESS,
          userId: user.account,
          walletType,
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
  }, [dispatch]);

  const logout = useCallback(async (): Promise<void> => {
    await simpleWalletService.logout();
    dispatch({ type: GameActionType.LOGOUT });
  }, [dispatch]);

  const buyGold = useCallback(async (waxAmount: number): Promise<boolean> => {
    try {
      // 1 WAXP = 1000 gold conversion rate
      const goldAmount = waxAmount * 1000;
      
      // Simulate transaction success for demo
      const result = true;
      
      if (result) {
        dispatch({
          type: GameActionType.BUY_GOLD,
          waxAmount,
          goldAmount
        });
        
        toast.success(`Purchased ${goldAmount} gold for ${waxAmount} WAXP`);
      }
      
      return result;
    } catch (error) {
      console.error("Error buying gold:", error);
      toast.error("Failed to buy gold");
      return false;
    }
  }, [dispatch]);

  const claimPlot = useCallback(async (x: number, y: number): Promise<boolean> => {
    try {
      // Edge plots cost 2000 gold, inner plots cost 1000 gold
      const isEdgePlot = x === 0 || y === 0 || x === 14 || y === 14;
      const cost = isEdgePlot ? 2000 : 1000;
      
      // Simulate transaction success for demo
      const result = true;
      
      if (result) {
        dispatch({
          type: GameActionType.CLAIM_PLOT,
          x,
          y,
          cost
        });
        
        toast.success(`Plot claimed at position [${x}, ${y}] for ${cost} gold`);
      }
      
      return result;
    } catch (error) {
      console.error("Error claiming plot:", error);
      toast.error("Failed to claim plot");
      return false;
    }
  }, [dispatch]);
  
  const payPlotFee = useCallback(async (fee: number, ownerAccount: string | null): Promise<boolean> => {
    try {
      // Simulate transaction success for demo
      const result = true;
      
      if (result) {
        dispatch({
          type: GameActionType.PAY_PLOT_FEE,
          fee
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error paying plot fee:", error);
      toast.error("Failed to pay plot fee");
      return false;
    }
  }, [dispatch]);
  
  const collectTreasure = useCallback(async (value: number): Promise<boolean> => {
    try {
      // Simulate transaction success for demo
      const result = true;
      
      if (result) {
        dispatch({
          type: GameActionType.COLLECT_TREASURE,
          value
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error collecting treasure:", error);
      return false;
    }
  }, [dispatch]);
  
  const payMovementFee = useCallback(async (fee: number, ownerAccount: string | null): Promise<boolean> => {
    try {
      const toTreasury = ownerAccount === null;
      
      // Simulate transaction success for demo
      const result = true;
      
      if (result) {
        dispatch({
          type: GameActionType.PAY_MOVEMENT_FEE,
          fee,
          toTreasury
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error paying movement fee:", error);
      toast.error("Failed to pay movement fee");
      return false;
    }
  }, [dispatch]);

  const resetPlotClaim = useCallback(() => {
    dispatch({ type: GameActionType.RESET_PLOT_CLAIM });
    toast.info("All plots have been relinquished for the next round!");
  }, [dispatch]);

  const clearLastFee = useCallback(() => {
    dispatch({ type: GameActionType.CLEAR_FEE });
  }, [dispatch]);

  return {
    login,
    logout,
    buyGold,
    claimPlot,
    payPlotFee,
    collectTreasure,
    payMovementFee,
    resetPlotClaim,
    clearLastFee
  };
}
