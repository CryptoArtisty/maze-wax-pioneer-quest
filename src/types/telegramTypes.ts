export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramBalance {
  stars: number;
}

export interface GameState {
  userId: string | null;
  isAuthenticated: boolean;
  telegramUser: TelegramUser | null;
  currentPosition: { x: number; y: number } | null;
  hasClaimedPlot: boolean;
  balance: TelegramBalance | null;
  goldBalance: number; // Gold earned in-game (separate from Telegram Stars)
  profitLoss: {
    profit: number;
    loss: number;
  } | null;
  lastFee: number;
  lastCollection: number;
  treasuryBalance: number;
}