
import { GameState, WalletType, WaxBalance } from '@/types/waxTypes';

export enum GameActionType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGOUT = 'LOGOUT',
  CLAIM_PLOT = 'CLAIM_PLOT',
  PAY_PLOT_FEE = 'PAY_PLOT_FEE',
  COLLECT_TREASURE = 'COLLECT_TREASURE',
  RESET_PLOT_CLAIM = 'RESET_PLOT_CLAIM',
  BUY_GOLD = 'BUY_GOLD',
  CLEAR_FEE = 'CLEAR_FEE',
  CLEAR_COLLECTION = 'CLEAR_COLLECTION',
}

export type GameAction =
  | { type: GameActionType.LOGIN_SUCCESS; userId: string; walletType: WalletType; balance: WaxBalance }
  | { type: GameActionType.LOGOUT }
  | { type: GameActionType.CLAIM_PLOT; x: number; y: number; cost: number }
  | { type: GameActionType.PAY_PLOT_FEE; fee: number }
  | { type: GameActionType.COLLECT_TREASURE; value: number }
  | { type: GameActionType.RESET_PLOT_CLAIM }
  | { type: GameActionType.BUY_GOLD; waxAmount: number; goldAmount: number }
  | { type: GameActionType.CLEAR_FEE }
  | { type: GameActionType.CLEAR_COLLECTION };

export const initialGameState: GameState = {
  userId: null,
  isAuthenticated: false,
  walletType: null,
  currentPosition: null,
  hasClaimedPlot: false,
  balance: null,
  goldBalance: 10000, // Starting gold balance
  profitLoss: {
    profit: 0,
    loss: 0,
  },
  lastFee: 0,
  lastCollection: 0,
};

export function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case GameActionType.LOGIN_SUCCESS:
      return {
        ...state,
        userId: action.userId,
        isAuthenticated: true,
        walletType: action.walletType,
        balance: action.balance,
        currentPosition: null, // Reset when logging in
        hasClaimedPlot: false, // Reset when logging in
        goldBalance: 10000, // Starting gold
        profitLoss: {
          profit: 0,
          loss: 0,
        },
        lastFee: 0,
        lastCollection: 0,
      };
      
    case GameActionType.LOGOUT:
      return initialGameState;
      
    case GameActionType.CLAIM_PLOT:
      return {
        ...state,
        currentPosition: { x: action.x, y: action.y },
        hasClaimedPlot: true,
        goldBalance: state.goldBalance - action.cost,
        lastFee: action.cost,
        profitLoss: {
          ...state.profitLoss!,
          loss: state.profitLoss!.loss + action.cost,
        },
      };
      
    case GameActionType.PAY_PLOT_FEE:
      return {
        ...state,
        goldBalance: state.goldBalance - action.fee,
        lastFee: action.fee,
        profitLoss: {
          ...state.profitLoss!,
          loss: state.profitLoss!.loss + action.fee,
        },
      };
      
    case GameActionType.COLLECT_TREASURE:
      return {
        ...state,
        goldBalance: state.goldBalance + action.value,
        lastCollection: action.value,
        profitLoss: {
          ...state.profitLoss!,
          profit: state.profitLoss!.profit + action.value,
        },
      };
      
    case GameActionType.RESET_PLOT_CLAIM:
      return {
        ...state,
        currentPosition: null,
        hasClaimedPlot: false,
      };
      
    case GameActionType.BUY_GOLD:
      return {
        ...state,
        balance: state.balance
          ? {
              ...state.balance,
              waxp: (parseFloat(state.balance.waxp) - action.waxAmount).toFixed(4),
            }
          : null,
        goldBalance: state.goldBalance + action.goldAmount,
      };
      
    case GameActionType.CLEAR_FEE:
      return {
        ...state,
        lastFee: 0,
      };
      
    case GameActionType.CLEAR_COLLECTION:
      return {
        ...state,
        lastCollection: 0,
      };
      
    default:
      return state;
  }
}
