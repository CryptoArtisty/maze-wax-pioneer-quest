
export interface WaxUser {
  account: string;
  publicKey: string;
  permission: string;
}

export interface WaxBalance {
  waxp: string;
  pgl: string;
}

export enum WalletType {
  CLOUD = 'cloud',
  ANCHOR = 'anchor'
}

export interface GameState {
  userId: string | null;
  isAuthenticated: boolean;
  walletType: WalletType | null;
  currentPosition: { x: number, y: number } | null;
  hasClaimedCell: boolean;
  balance: WaxBalance | null;
}
