
import { useRef, useEffect } from 'react';
import { MazeCell, GridCell, Treasure, ExitCell, PlayerPosition } from '@/types/gameTypes';

interface UseCanvasDrawingProps {
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

export const useCanvasDrawing = ({
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
}: UseCanvasDrawingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CELL_SIZE = 40; // Size of each cell in pixels

  // Draw the game on canvas
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // We'll pass the context to renderers in GameCanvas
    return ctx;
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (e.currentTarget.width / rect.width);
    const y = (e.clientY - rect.top) * (e.currentTarget.height / rect.height);
    onCellClick(x, y);
  };

  return {
    canvasRef,
    drawGame,
    handleCanvasClick,
    CELL_SIZE,
  };
};
