export interface LightningUser {
  node: {
    alias: string;
    pubkey: string;
    color?: string;
  };
  balance?: number; // in satoshis
}

export interface LightningBalance {
  satoshis: number;
}

export interface GameState {
  userId: string | null;
  isAuthenticated: boolean;
  lightningUser: LightningUser | null;
  currentPosition: { x: number; y: number } | null;
  hasClaimedPlot: boolean;
  balance: LightningBalance | null;
  goldBalance: number; // Gold earned in-game (separate from Satoshis)
  profitLoss: {
    profit: number;
    loss: number;
  } | null;
  lastFee: number;
  lastCollection: number;
  treasuryBalance: number;
}