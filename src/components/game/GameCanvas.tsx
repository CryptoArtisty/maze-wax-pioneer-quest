
import React, { useRef, useEffect } from 'react';
import { MazeCell, Treasure, ExitCell, PlayerPosition, GridCell } from '@/types/gameTypes';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CELL_SIZE = 40; // Size of each cell in pixels

  // Update the canvas on any state change
  useEffect(() => {
    drawGame();
  }, [gridCells, maze, player, treasures, exitCell, hintPaths, gamePhase]);

  function drawGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw maze elements if in play phase
    if (gamePhase === 'play') {
      drawMazeElements(ctx);
    }
    
    // Draw hint paths
    if (hintPaths.length > 0) {
      drawHintPaths(ctx);
    }
  }

  function drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "rgba(255,215,0,0.3)"; // Grid line color
    ctx.lineWidth = 1;
    
    // Draw vertical grid lines
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, rows * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(cols * CELL_SIZE, r * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw claimed plots - now with just one checkmark
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (gridCells[r] && gridCells[r][c] && gridCells[r][c].owner) {
          // Add a subtle background to claimed plots
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          
          // Draw a single checkmark
          ctx.font = `bold ${CELL_SIZE / 2}px sans-serif`;
          ctx.fillStyle = "#FFD700"; // Gold color
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("✓", c * CELL_SIZE + CELL_SIZE / 2, r * CELL_SIZE + CELL_SIZE / 2);
        }
      }
    }
  }

  function drawMazeElements(ctx: CanvasRenderingContext2D) {
    // Draw maze walls
    maze.forEach(cell => {
      const x = cell.col * CELL_SIZE, y = cell.row * CELL_SIZE;
      ctx.strokeStyle = "#00ffff"; // Maze wall color
      ctx.lineWidth = 4;
      
      if (cell.walls.top) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + CELL_SIZE, y);
        ctx.stroke();
      }
      
      if (cell.walls.right) {
        ctx.beginPath();
        ctx.moveTo(x + CELL_SIZE, y);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
        ctx.stroke();
      }
      
      if (cell.walls.bottom) {
        ctx.beginPath();
        ctx.moveTo(x + CELL_SIZE, y + CELL_SIZE);
        ctx.lineTo(x, y + CELL_SIZE);
        ctx.stroke();
      }
      
      if (cell.walls.left) {
        ctx.beginPath();
        ctx.moveTo(x, y + CELL_SIZE);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });
    
    // Draw treasures
    treasures.forEach(t => {
      if (!t.collected) {
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(
          t.col * CELL_SIZE + CELL_SIZE / 2, 
          t.row * CELL_SIZE + CELL_SIZE / 2, 
          CELL_SIZE * 0.2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      }
    });
    
    // Draw exit
    if (exitCell) {
      ctx.fillStyle = "green";
      ctx.fillRect(
        exitCell.col * CELL_SIZE + CELL_SIZE * 0.2, 
        exitCell.row * CELL_SIZE + CELL_SIZE * 0.2, 
        CELL_SIZE * 0.6, 
        CELL_SIZE * 0.6
      );
    }
    
    // Draw player
    if (player) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        player.col * CELL_SIZE + CELL_SIZE * 0.2, 
        player.row * CELL_SIZE + CELL_SIZE * 0.2, 
        CELL_SIZE * 0.6, 
        CELL_SIZE * 0.6
      );
    }
  }

  function drawHintPaths(ctx: CanvasRenderingContext2D) {
    if (!hintPaths.length) return;
    
    ctx.fillStyle = "rgba(0,255,255,0.3)"; // Hint path color
    hintPaths.forEach(path => {
      path.forEach(([col, row]) => {
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });
    });
  }

  return (
    <canvas
      ref={canvasRef}
      width={cols * CELL_SIZE}
      height={rows * CELL_SIZE}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (e.currentTarget.width / rect.width);
        const y = (e.clientY - rect.top) * (e.currentTarget.height / rect.height);
        onCellClick(x, y);
      }}
      className="bg-gradient-to-b from-canvas-gradient-top to-canvas-gradient-bottom border-4 border-hieroglyphic-brown rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] max-w-full"
    />
  );
};

export default GameCanvas;
