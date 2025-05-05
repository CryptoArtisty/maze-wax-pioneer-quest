
import React from 'react';
import { toast } from 'sonner';
import { GamePhase, GridCell } from '@/types/gameTypes';
import { GameState } from '@/types/waxTypes';

interface CellHandlerProps {
  gridCells: GridCell[][];
  setGridCells: (cells: GridCell[][]) => void;
  gameState: GameState;
  gamePhase: GamePhase;
  claimPlot: (x: number, y: number) => Promise<boolean>;
  movePlayer: (x: number, y: number) => void;
  cols: number;
  rows: number;
}

export const CellHandler: React.FC<CellHandlerProps> = ({
  gridCells,
  setGridCells,
  gameState,
  gamePhase,
  claimPlot,
  movePlayer,
  cols,
  rows
}) => {
  const handleCellClick = async (x: number, y: number) => {
    const cellCol = Math.floor(x / 40); // CELL_SIZE = 40
    const cellRow = Math.floor(y / 40);
    
    if (cellCol < 0 || cellRow < 0 || cellCol >= cols || cellRow >= rows) {
      return;
    }
    
    if (gamePhase === 'claim') {
      if (!gameState.isAuthenticated) {
        toast("Please login to claim a plot");
        return;
      }
      
      if (gameState.hasClaimedPlot) {
        toast("You've already claimed a plot this phase!");
        return;
      }
      
      // Check if plot is already claimed
      if (gridCells[cellRow][cellCol].owner) {
        toast(`Plot (${cellCol},${cellRow}) already claimed.`);
        return;
      }
      
      // Claim the plot
      const success = await claimPlot(cellCol, cellRow);
      if (success) {
        const newGridCells = [...gridCells];
        newGridCells[cellRow][cellCol].owner = gameState.userId || null;
        newGridCells[cellRow][cellCol].nickname = gameState.userId?.substring(0, 3) || "";
        setGridCells(newGridCells);
        
        // Show the plot claimed message
        toast.success(`You claimed plot (${cellCol}, ${cellRow})`);
      }
    } else if (gamePhase === 'play') {
      // Check if the player has claimed a plot before allowing movement
      if (!gameState.hasClaimedPlot) {
        toast.error("You must claim a cell during the claim phase before you can play!");
        return;
      }
      
      // Try to move player to clicked cell
      movePlayer(cellCol, cellRow);
    }
  };

  // Return null since this is a controller component without UI
  return null;
};

// Export a hook version of the CellHandler for easier consumption
export const useCellHandler = (props: CellHandlerProps) => {
  const { 
    gridCells,
    setGridCells,
    gameState,
    gamePhase,
    claimPlot,
    movePlayer,
    cols,
    rows
  } = props;
  
  const handleCellClick = async (x: number, y: number) => {
    const cellCol = Math.floor(x / 40); // CELL_SIZE = 40
    const cellRow = Math.floor(y / 40);
    
    if (cellCol < 0 || cellRow < 0 || cellCol >= cols || cellRow >= rows) {
      return;
    }
    
    if (gamePhase === 'claim') {
      if (!gameState.isAuthenticated) {
        toast("Please login to claim a plot");
        return;
      }
      
      if (gameState.hasClaimedPlot) {
        toast("You've already claimed a plot this phase!");
        return;
      }
      
      // Check if plot is already claimed
      if (gridCells[cellRow][cellCol].owner) {
        toast(`Plot (${cellCol},${cellRow}) already claimed.`);
        return;
      }
      
      // Claim the plot
      const success = await claimPlot(cellCol, cellRow);
      if (success) {
        const newGridCells = [...gridCells];
        newGridCells[cellRow][cellCol].owner = gameState.userId || null;
        newGridCells[cellRow][cellCol].nickname = gameState.userId?.substring(0, 3) || "";
        setGridCells(newGridCells);
        
        // Show the plot claimed message
        toast.success(`You claimed plot (${cellCol}, ${cellRow})`);
      }
    } else if (gamePhase === 'play') {
      // Check if the player has claimed a plot before allowing movement
      if (!gameState.hasClaimedPlot) {
        toast.error("You must claim a cell during the claim phase before you can play!");
        return;
      }
      
      // Try to move player to clicked cell
      movePlayer(cellCol, cellRow);
    }
  };

  return { handleCellClick };
};

export default CellHandler;
