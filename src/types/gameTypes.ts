
export type GamePhase = 'claim' | 'play';

export interface GridCell {
  owner: string | null;
  nickname: string;
}

export interface MazeCell {
  col: number;
  row: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
}

export interface Treasure {
  col: number;
  row: number;
  collected: boolean;
  value: number;
}

export interface ExitCell {
  col: number;
  row: number;
}

export interface PlayerPosition {
  col: number;
  row: number;
}
