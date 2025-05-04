
import React, { useEffect } from 'react';
import { MazeCell, Treasure, ExitCell, PlayerPosition, GridCell } from '@/types/gameTypes';
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing';
import { GridRenderer } from './GridRenderer';
import { MazeRenderer } from './MazeRenderer';
import { HintRenderer } from './HintRenderer';

interface GameCanvasProps {
  rows: number;
  cols: number;
  gridCells: GridCell[][];
  maze: MazeCell[];
  player: PlayerPosition | null;
  treasures: Treasure[];
  exitCell: ExitCell | null;
  hintPaths: Array<Array<[number, number]>>;
  gamePhase: 'claim' | 'play';
  onCellClick: (x: number, y: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  rows,
  cols,
  gridCells,
  maze,
  player,
  treasures,
  exitCell,
  hintPaths,
  gamePhase,
  onCellClick
}) => {
  const { canvasRef, drawGame, handleCanvasClick, CELL_SIZE } = useCanvasDrawing({
    rows,
    cols,
    gridCells,
    maze,
    player,
    treasures,
    exitCell,
    hintPaths,
    gamePhase,
    onCellClick
  });

  // Update the canvas on any state change
  useEffect(() => {
    const ctx = drawGame();
    if (!ctx) return;
    
    // Draw grid
    const gridRenderer = new GridRenderer({
      ctx, rows, cols, cellSize: CELL_SIZE, gridCells
    });
    gridRenderer.draw();
    
    // Draw maze elements if in play phase
    if (gamePhase === 'play') {
      // Draw hint paths first (so they're underneath other elements)
      if (hintPaths.length > 0) {
        const hintRenderer = new HintRenderer({
          ctx, cellSize: CELL_SIZE, hintPaths
        });
        hintRenderer.draw();
      }
      
      const mazeRenderer = new MazeRenderer({
        ctx, cellSize: CELL_SIZE, maze, treasures, exitCell, player
      });
      mazeRenderer.draw();
    }
  }, [gridCells, maze, player, treasures, exitCell, hintPaths, gamePhase, rows, cols, CELL_SIZE]);

  return (
    <canvas
      ref={canvasRef}
      width={cols * CELL_SIZE}
      height={rows * CELL_SIZE}
      onClick={handleCanvasClick}
      className="bg-gradient-to-b from-canvas-gradient-top to-canvas-gradient-bottom border-4 border-hieroglyphic-brown rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] max-w-full"
    />
  );
};

export default GameCanvas;
