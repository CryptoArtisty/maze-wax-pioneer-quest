
import React, { useState, useEffect } from 'react';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { toast } from 'sonner';

interface MazeGridProps {
  rows: number;
  cols: number;
}

// Create a maze grid
const MazeGrid: React.FC<MazeGridProps> = ({ rows, cols }) => {
  const { gameState, claimCell } = useWaxWallet();
  const [grid, setGrid] = useState<Array<Array<string>>>([]); // Cell types: 'empty', 'wall', 'player', 'claimed'
  const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    // Generate a simple maze
    const newGrid: Array<Array<string>> = [];
    for (let i = 0; i < rows; i++) {
      const row: Array<string> = [];
      for (let j = 0; j < cols; j++) {
        // Create a simple maze pattern
        if (i % 2 === 0 && j % 2 === 0) {
          row.push('wall');
        } else {
          row.push('empty');
        }
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  }, [rows, cols]);

  // Update grid when player claims a cell
  useEffect(() => {
    if (gameState.currentPosition) {
      const { x, y } = gameState.currentPosition;
      
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        // Mark all previously claimed cells as empty first
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (newGrid[i][j] === 'claimed') {
              newGrid[i][j] = 'empty';
            }
          }
        }
        // Only set the cell if it's within bounds and not a wall
        if (x >= 0 && x < cols && y >= 0 && y < rows && newGrid[y][x] !== 'wall') {
          newGrid[y][x] = 'claimed';
        }
        return newGrid;
      });
    }
  }, [gameState.currentPosition, rows, cols]);

  const handleCellClick = async (x: number, y: number) => {
    if (!gameState.isAuthenticated) {
      toast.error("Please log in to claim a cell");
      return;
    }

    if (gameState.hasClaimedCell) {
      toast.info("You've already claimed a cell!");
      return;
    }

    if (grid[y][x] === 'wall') {
      toast.error("You cannot claim a wall!");
      return;
    }

    const success = await claimCell(x, y);
    if (success) {
      toast.success(`Cell claimed at position [${x}, ${y}]`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="overflow-auto max-w-full p-4">
        <div 
          className="grid gap-1 p-4 rounded-lg bg-maze-bg border border-maze-wall shadow-lg"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(40px, 1fr))`,
          }}
        >
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <div 
                key={`${x}-${y}`}
                className={`
                  grid-cell w-10 h-10 rounded flex items-center justify-center cursor-pointer
                  ${cell === 'empty' ? 'bg-maze-path' : ''}
                  ${cell === 'wall' ? 'bg-maze-wall' : ''}
                  ${cell === 'claimed' ? 'bg-maze-highlight' : ''}
                  ${hoveredCell?.x === x && hoveredCell?.y === y && cell !== 'wall' ? 'ring-2 ring-maze-highlight' : ''}
                  ${cell === 'claimed' ? 'claimed-cell' : ''}
                `}
                onClick={() => handleCellClick(x, y)}
                onMouseEnter={() => setHoveredCell({x, y})}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {cell === 'claimed' && (
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-black">
                    {gameState.userId?.substring(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground px-4">
        {!gameState.hasClaimedCell ? (
          <p>Click on a cell to claim your starting position</p>
        ) : (
          <p>You've claimed cell [{gameState.currentPosition?.x}, {gameState.currentPosition?.y}]</p>
        )}
      </div>
    </div>
  );
};

export default MazeGrid;
