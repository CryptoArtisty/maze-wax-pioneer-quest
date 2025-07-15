import { GameState, TelegramUser, TelegramBalance } from '@/types/telegramTypes';

export enum GameActionType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGOUT = 'LOGOUT',
  BUY_GOLD = 'BUY_GOLD',
  CLAIM_PLOT = 'CLAIM_PLOT',
  PAY_PLOT_FEE = 'PAY_PLOT_FEE',
  COLLECT_TREASURE = 'COLLECT_TREASURE',
  PAY_MOVEMENT_FEE = 'PAY_MOVEMENT_FEE',
  RESET_PLOT_CLAIM = 'RESET_PLOT_CLAIM',
  CLEAR_FEE = 'CLEAR_FEE',
  UPDATE_POSITION = 'UPDATE_POSITION',
}

export type GameAction =
  | { type: GameActionType.LOGIN_SUCCESS; userId: string; telegramUser: TelegramUser; balance: TelegramBalance }
  | { type: GameActionType.LOGOUT }
  | { type: GameActionType.BUY_GOLD; starsAmount: number; goldAmount: number }
  | { type: GameActionType.CLAIM_PLOT; x: number; y: number; cost: number }
  | { type: GameActionType.PAY_PLOT_FEE; fee: number }
  | { type: GameActionType.COLLECT_TREASURE; value: number }
  | { type: GameActionType.PAY_MOVEMENT_FEE; fee: number; toTreasury: boolean }
  | { type: GameActionType.RESET_PLOT_CLAIM }
  | { type: GameActionType.CLEAR_FEE }
  | { type: GameActionType.UPDATE_POSITION; x: number; y: number };

export function telegramGameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case GameActionType.LOGIN_SUCCESS:
      return {
        ...state,
        userId: action.userId,
        isAuthenticated: true,
        telegramUser: action.telegramUser,
        balance: action.balance,
      };

    case GameActionType.LOGOUT:
      return {
        ...state,
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
      };

    case GameActionType.BUY_GOLD:
      return {
        ...state,
        goldBalance: state.goldBalance + action.goldAmount,
        balance: state.balance ? {
          ...state.balance,
          stars: state.balance.stars - action.starsAmount
        } : null,
      };

    case GameActionType.CLAIM_PLOT:
      return {
        ...state,
        currentPosition: { x: action.x, y: action.y },
        hasClaimedPlot: true,
        goldBalance: state.goldBalance - action.cost,
        lastFee: action.cost,
      };

    case GameActionType.PAY_PLOT_FEE:
      return {
        ...state,
        goldBalance: state.goldBalance - action.fee,
        lastFee: action.fee,
        profitLoss: state.profitLoss ? {
          ...state.profitLoss,
          loss: state.profitLoss.loss + action.fee
        } : { profit: 0, loss: action.fee },
      };

    case GameActionType.COLLECT_TREASURE:
      return {
        ...state,
        goldBalance: state.goldBalance + action.value,
        lastCollection: action.value,
        profitLoss: state.profitLoss ? {
          ...state.profitLoss,
          profit: state.profitLoss.profit + action.value
        } : { profit: action.value, loss: 0 },
      };

    case GameActionType.PAY_MOVEMENT_FEE:
      return {
        ...state,
        goldBalance: state.goldBalance - action.fee,
        lastFee: action.fee,
        treasuryBalance: action.toTreasury ? state.treasuryBalance + action.fee : state.treasuryBalance,
        profitLoss: state.profitLoss ? {
          ...state.profitLoss,
          loss: state.profitLoss.loss + action.fee
        } : { profit: 0, loss: action.fee },
      };

    case GameActionType.RESET_PLOT_CLAIM:
      return {
        ...state,
        hasClaimedPlot: false,
        currentPosition: null,
      };

    case GameActionType.CLEAR_FEE:
      return {
        ...state,
        lastFee: 0,
        lastCollection: 0,
      };

    case GameActionType.UPDATE_POSITION:
      return {
        ...state,
        currentPosition: { x: action.x, y: action.y },
      };

    default:
      return state;
  }
}