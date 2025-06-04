
import { useRef, useEffect, useState } from 'react';
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
  const [cellSize, setCellSize] = useState(40);

  // Calculate responsive cell size based on screen width
  useEffect(() => {
    const calculateCellSize = () => {
      const screenWidth = window.innerWidth;
      const padding = 32; // Account for container padding
      const availableWidth = screenWidth - padding;
      
      // Calculate cell size based on available width and number of columns
      const maxCellSize = Math.floor(availableWidth / cols);
      
      // Set minimum and maximum cell sizes
      const minCellSize = 20; // Minimum for touch interaction
      const maxCellSize = 40; // Maximum for desktop
      
      const responsiveCellSize = Math.max(minCellSize, Math.min(maxCellSize, maxCellSize));
      setCellSize(responsiveCellSize);
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);
    
    return () => window.removeEventListener('resize', calculateCellSize);
  }, [cols]);

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
    CELL_SIZE: cellSize,
  };
};
