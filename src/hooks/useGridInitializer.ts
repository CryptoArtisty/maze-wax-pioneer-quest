import { useState, useEffect } from 'react';
import { generateMaze } from '@/utils/mazeGenerator';
import { generateTreasures, chooseRandomEdgeCell } from '@/utils/gameElements';
import { MazeCell, GridCell, PlayerPosition, Treasure, ExitCell, GamePhase } from '@/types/gameTypes';
import { GameState } from '@/types/waxTypes';

interface UseGridInitializerProps {
  rows: number;
  cols: number;
  gamePhase: GamePhase;
  gameState: GameState;
}

export function useGridInitializer({ rows, cols, gamePhase, gameState }: UseGridInitializerProps) {
  const [gridCells, setGridCells] = useState<GridCell[][]>([]);
  const [maze, setMaze] = useState<MazeCell[]>([]);
  const [player, setPlayer] = useState<PlayerPosition | null>(null);
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [exitCell, setExitCell] = useState<ExitCell | null>(null);
  const [hintPaths, setHintPaths] = useState<Array<Array<[number, number]>>>([]);

  // Only regenerate grid when game phase changes to claim
  useEffect(() => {
    if (gamePhase === 'claim') {
      // Initialize grid
      const newGridCells: GridCell[][] = Array(rows).fill(null)
        .map(() => Array(cols).fill(null)
          .map(() => ({ owner: null, nickname: '' })));
      
      setGridCells(newGridCells);
      setPlayer(null);
      
      // Generate new maze when phase changes to claim
      const newMaze = generateMaze(cols, rows);
      setMaze(newMaze);
      
      // Generate treasures based on the treasury balance
      const newTreasures = generateTreasures(rows, cols, gameState.treasuryBalance);
      setTreasures(newTreasures);
      
      // Choose random exit cell
      const newExitCell = chooseRandomEdgeCell(rows, cols);
      setExitCell(newExitCell);
      
      // Reset hint paths
      setHintPaths([]);
    }
  }, [gamePhase, rows, cols, gameState.treasuryBalance]);
  
  // Update player position when gameState.currentPosition changes
  useEffect(() => {
    if (gameState.currentPosition) {
      setPlayer({
        col: gameState.currentPosition.x,
        row: gameState.currentPosition.y
      });
    }
  }, [gameState.currentPosition]);

  return {
    gridCells,
    maze,
    player,
    treasures,
    exitCell,
    hintPaths,
    setGridCells,
    setPlayer,
    setTreasures,
    setHintPaths
  };
}
