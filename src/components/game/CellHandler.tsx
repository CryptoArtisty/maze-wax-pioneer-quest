
import { useCallback } from 'react';
import { GridCell } from '@/types/gameTypes';
import { GameState } from '@/types/waxTypes';
import { GamePhase } from '@/types/gameTypes';
import { toast } from 'sonner';
import { globalTimer } from '@/services/globalTimerService';

interface CellHandlerProps {
  gridCells: GridCell[][];
  setGridCells: (cells: GridCell[][]) => void;
  gameState: GameState;
  gamePhase: GamePhase;
  claimPlot: (x: number, y: number, cost: number) => Promise<boolean>;
  movePlayer: (col: number, row: number) => void;
  cols: number;
  rows: number;
  cellSize: number;
}

export function useCellHandler({
  gridCells,
  setGridCells,
  gameState,
  gamePhase,
  claimPlot,
  movePlayer,
  cols,
  rows,
  cellSize
}: CellHandlerProps) {

  const handleCellClick = useCallback(async (col: number, row: number) => {
    console.log(`Cell clicked: [${col}, ${row}], Phase: ${gamePhase}`);
    
    // Check global game state to ensure we can actually join
    const globalState = globalTimer.getCurrentGameState();
    
    if (gamePhase === 'claim') {
      // Verify this is actually a claim phase globally
      if (!globalState.canJoinNow) {
        toast.error("Cannot claim plots during play phase. Wait for next round!");
        return;
      }
      
      // Check if user is authenticated
      if (!gameState.isAuthenticated) {
        toast.error("Please connect your wallet to claim a plot!");
        return;
      }

      // Check if user has already claimed a plot this round
      if (gameState.hasClaimedPlot) {
        toast.warning("You have already claimed a plot this round!");
        return;
      }

      // Check if the cell is available (not claimed by anyone)
      const targetCell = gridCells[row]?.[col];
      if (!targetCell) {
        console.error("Target cell not found");
        return;
      }

      if (targetCell.owner) {
        toast.error("This cell is already claimed by another player!");
        return;
      }

      console.log(`Attempting to claim plot at [${col}, ${row}]`);
      
      // Attempt to claim the plot (free for now)
      const success = await claimPlot(col, row, 0);
      
      if (success) {
        // Update the grid to show the claimed cell
        const newGridCells = gridCells.map((rowCells, rowIndex) =>
          rowCells.map((cell, colIndex) => {
            if (rowIndex === row && colIndex === col) {
              return {
                ...cell,
                owner: gameState.userId,
                ownerNickname: gameState.userId?.split('.')[0] || 'Unknown'
              };
            }
            return cell;
          })
        );
        setGridCells(newGridCells);
        
        toast.success(`Plot claimed at [${col}, ${row}]!`);
      } else {
        toast.error("Failed to claim plot. Please try again.");
      }
    } else if (gamePhase === 'play') {
      // During play phase, clicking should move the player
      if (!gameState.hasClaimedPlot) {
        toast.error("You must claim a cell during the claim phase before you can play!");
        return;
      }
      
      movePlayer(col, row);
    }
  }, [gridCells, setGridCells, gameState, gamePhase, claimPlot, movePlayer, cols, rows, cellSize]);

  return { handleCellClick };
}
