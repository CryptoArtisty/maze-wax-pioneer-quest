
import { useState, useEffect } from 'react';
import { GridCell, MazeCell, Treasure, ExitCell, PlayerPosition, GamePhase } from '@/types/gameTypes';
import { GameState } from '@/types/waxTypes';
import { initializeMaze, generateTreasures, chooseRandomEdgeCell } from '@/utils/mazeUtils';

interface UseGridInitializerProps {
  rows: number;
  cols: number;
  gamePhase: GamePhase;
  gameState: GameState;
}

interface GridState {
  gridCells: GridCell[][];
  maze: MazeCell[];
  player: PlayerPosition | null;
  treasures: Treasure[];
  exitCell: ExitCell | null;
  hintPaths: Array<Array<[number, number]>>;
}

export function useGridInitializer({
  rows,
  cols,
  gamePhase,
  gameState
}: UseGridInitializerProps): GridState & {
  setGridCells: (cells: GridCell[][]) => void;
  setMaze: (maze: MazeCell[]) => void;
  setPlayer: (player: PlayerPosition) => void;
  setTreasures: (treasures: Treasure[]) => void;
  setExitCell: (cell: ExitCell | null) => void;
  setHintPaths: (paths: Array<Array<[number, number]>>) => void;
} {
  const [gridCells, setGridCells] = useState<GridCell[][]>([]);
  const [maze, setMaze] = useState<MazeCell[]>([]);
  const [player, setPlayer] = useState<PlayerPosition | null>(null);
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [exitCell, setExitCell] = useState<ExitCell | null>(null);
  const [hintPaths, setHintPaths] = useState<Array<Array<[number, number]>>>([]);
  
  // Initialize grid cells
  useEffect(() => {
    const newGridCells: GridCell[][] = [];
    for (let r = 0; r < rows; r++) {
      newGridCells[r] = [];
      for (let c = 0; c < cols; c++) {
        newGridCells[r][c] = { owner: null, nickname: "" };
      }
    }
    setGridCells(newGridCells);
  }, [rows, cols]);

  // Reset grid cells at the start of a new claim phase
  useEffect(() => {
    if (gamePhase === 'claim') {
      // Clear all cell claims for a fresh round
      const newGridCells: GridCell[][] = [];
      for (let r = 0; r < rows; r++) {
        newGridCells[r] = [];
        for (let c = 0; c < cols; c++) {
          newGridCells[r][c] = { owner: null, nickname: "" };
        }
      }
      setGridCells(newGridCells);
    }
  }, [gamePhase, rows, cols]);

  // Initialize maze when phase changes to play
  useEffect(() => {
    if (gamePhase === 'play' && gameState.currentPosition) {
      const newMaze = initializeMaze(rows, cols);
      setMaze(newMaze);
      
      const newTreasures = generateTreasures(rows, cols);
      setTreasures(newTreasures);
      
      setPlayer({
        col: gameState.currentPosition.x,
        row: gameState.currentPosition.y
      });
      
      setExitCell(chooseRandomEdgeCell(rows, cols));
    }
  }, [gamePhase, gameState.currentPosition, rows, cols]);

  return {
    gridCells,
    maze,
    player,
    treasures,
    exitCell,
    hintPaths,
    setGridCells,
    setMaze,
    setPlayer,
    setTreasures,
    setExitCell,
    setHintPaths
  };
}
