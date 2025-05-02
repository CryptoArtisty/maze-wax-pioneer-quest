import React, { useState, useEffect } from 'react';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { toast } from 'sonner';
import { GamePhase, GridCell, MazeCell, Treasure, ExitCell, PlayerPosition } from '@/types/gameTypes';
import GameCanvas from '@/components/game/GameCanvas';
import { initializeMaze, generateTreasures, chooseRandomEdgeCell } from '@/utils/mazeUtils';
import { usePlayerMovement } from '@/hooks/usePlayerMovement';

interface MazeGridProps {
  rows: number;
  cols: number;
  gamePhase: GamePhase;
  onScoreChange: (score: number) => void;
}

const MazeGrid: React.FC<MazeGridProps> = ({ rows, cols, gamePhase, onScoreChange }) => {
  const { gameState, claimPlot, payPlotFee, payMovementFee, collectTreasure } = useWaxWallet();
  const [gridCells, setGridCells] = useState<GridCell[][]>([]);
  const [maze, setMaze] = useState<MazeCell[]>([]);
  const [player, setPlayer] = useState<PlayerPosition | null>(null);
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [exitCell, setExitCell] = useState<ExitCell | null>(null);
  const [score, setScore] = useState(0);
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

  // Use player movement hook with the new payMovementFee function
  const { movePlayer } = usePlayerMovement({
    player,
    setPlayer,
    maze,
    gridCells,
    treasures,
    setTreasures,
    exitCell,
    gameState,
    payPlotFee,
    payMovementFee, // Add payMovementFee
    collectTreasure,
    score,
    setScore,
    onScoreChange,
    rows,
    cols
  });

  // Handle cell click
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
    } else if (gamePhase === 'play' && player) {
      // Try to move player to clicked cell
      movePlayer(cellCol, cellRow);
    }
  };

  // Handle key presses for movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhase !== 'play' || !player) return;
      
      let newCol = player.col;
      let newRow = player.row;
      
      switch (e.key) {
        case 'ArrowUp':
          newRow--;
          break;
        case 'ArrowDown':
          newRow++;
          break;
        case 'ArrowLeft':
          newCol--;
          break;
        case 'ArrowRight':
          newCol++;
          break;
        default:
          return;
      }
      
      movePlayer(newCol, newRow);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, gamePhase, movePlayer]);

  // Show hint paths for a few seconds
  const showHint = () => {
    // Implement pathfinding logic here
    toast("Hint shown for 3 seconds");
    
    // Clear hint paths after 3 seconds
    setTimeout(() => {
      setHintPaths([]);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center">
      <GameCanvas 
        rows={rows}
        cols={cols}
        gridCells={gridCells}
        maze={maze}
        player={player}
        treasures={treasures}
        exitCell={exitCell}
        hintPaths={hintPaths}
        gamePhase={gamePhase}
        onCellClick={handleCellClick}
      />
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {gamePhase === 'claim' ? (
          <p>Click on a plot to claim your starting position</p>
        ) : (
          <p>
            {player ? 
              `Your position: [${player.col}, ${player.row}]` : 
              "No position set"
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default MazeGrid;
