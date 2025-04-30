
import React, { useState, useEffect, useRef } from 'react';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { toast } from 'sonner';
import { GamePhase, GridCell, MazeCell, Treasure, ExitCell, PlayerPosition } from '@/types/gameTypes';

interface MazeGridProps {
  rows: number;
  cols: number;
  gamePhase: GamePhase;
  onScoreChange: (score: number) => void;
}

const MazeGrid: React.FC<MazeGridProps> = ({ rows, cols, gamePhase, onScoreChange }) => {
  const { gameState, claimPlot, payPlotFee, collectTreasure } = useWaxWallet();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridCells, setGridCells] = useState<GridCell[][]>([]);
  const [maze, setMaze] = useState<MazeCell[]>([]);
  const [player, setPlayer] = useState<PlayerPosition | null>(null);
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [exitCell, setExitCell] = useState<ExitCell | null>(null);
  const [score, setScore] = useState(0);
  const [hintPaths, setHintPaths] = useState<Array<Array<[number, number]>>>([]);
  
  const CELL_SIZE = 40; // Size of each cell in pixels

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

  // Initialize maze when phase changes to play
  useEffect(() => {
    if (gamePhase === 'play' && gameState.currentPosition) {
      initializeMaze();
      generateTreasures();
      setPlayer({
        col: gameState.currentPosition.x,
        row: gameState.currentPosition.y
      });
      setExitCell(chooseRandomEdgeCell());
    }
  }, [gamePhase, gameState.currentPosition]);

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
    
    // Draw claimed cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (gridCells[r] && gridCells[r][c] && gridCells[r][c].owner) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          
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

  function initializeMaze() {
    // Create empty maze cells
    const newMaze: MazeCell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newMaze.push({
          col: c,
          row: r,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        });
      }
    }
    
    // Generate the maze using depth-first search
    generateMaze(newMaze);
    setMaze(newMaze);
  }

  function generateMaze(maze: MazeCell[]) {
    const stack: MazeCell[] = [];
    let current = maze[0];
    current.visited = true;
    
    while (true) {
      const next = checkNeighbors(current, maze);
      
      if (next) {
        next.visited = true;
        stack.push(current);
        removeWalls(current, next);
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      } else {
        break;
      }
    }
  }

  function checkNeighbors(cell: MazeCell, maze: MazeCell[]): MazeCell | undefined {
    const { col, row } = cell;
    const neighbors: MazeCell[] = [];
    const directions = [
      [col, row - 1], [col + 1, row],
      [col, row + 1], [col - 1, row]
    ];
    
    for (const [c, r] of directions) {
      const idx = c + r * cols;
      if (c >= 0 && r >= 0 && c < cols && r < rows && maze[idx] && !maze[idx].visited) {
        neighbors.push(maze[idx]);
      }
    }
    
    return neighbors.length ? neighbors[Math.floor(Math.random() * neighbors.length)] : undefined;
  }

  function removeWalls(a: MazeCell, b: MazeCell) {
    const x = a.col - b.col;
    if (x === 1) {
      a.walls.left = false;
      b.walls.right = false;
    } else if (x === -1) {
      a.walls.right = false;
      b.walls.left = false;
    }
    
    const y = a.row - b.row;
    if (y === 1) {
      a.walls.top = false;
      b.walls.bottom = false;
    } else if (y === -1) {
      a.walls.bottom = false;
      b.walls.top = false;
    }
  }

  function generateTreasures() {
    const newTreasures: Treasure[] = [];
    let treasureCount = Math.floor(cols * rows * 0.1); // 10% of cells have treasures
    
    while (newTreasures.length < treasureCount) {
      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);
      
      if (!newTreasures.find(t => t.col === col && t.row === row)) {
        // Treasure values are now in gold
        const value = Math.floor(Math.sqrt(col * col + row * row)) * 500; // 100x more gold than before
        newTreasures.push({ col, row, collected: false, value });
      }
    }
    
    setTreasures(newTreasures);
  }

  function chooseRandomEdgeCell(): ExitCell {
    const edgeCells: ExitCell[] = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
          edgeCells.push({ col: c, row: r });
        }
      }
    }
    
    return edgeCells[Math.floor(Math.random() * edgeCells.length)];
  }

  function canMoveTo(col: number, row: number): boolean {
    if (!player) return false;
    
    if (col < 0 || row < 0 || col >= cols || row >= rows) {
      return false;
    }
    
    // Get current cell index
    const currentCellIndex = player.col + player.row * cols;
    const currentCell = maze[currentCellIndex];
    
    if (!currentCell) return false;
    
    const dx = col - player.col;
    const dy = row - player.row;
    
    // Only allow movement to adjacent cells
    if (Math.abs(dx) + Math.abs(dy) !== 1) return false;
    
    // Check walls
    if (dx === 1 && currentCell.walls.right) return false;
    if (dx === -1 && currentCell.walls.left) return false;
    if (dy === 1 && currentCell.walls.bottom) return false;
    if (dy === -1 && currentCell.walls.top) return false;
    
    return true;
  }

  function movePlayer(newCol: number, newRow: number) {
    if (gamePhase !== 'play' || !player) {
      toast("Movement allowed only in play phase!");
      return;
    }
    
    if (!canMoveTo(newCol, newRow)) {
      toast("Blocked!");
      return;
    }
    
    // Check if stepping on someone else's plot - would require plot fee
    const PLOT_FEE = 50; // 50 gold plot fee
    
    const cellInfo = gridCells[newRow][newCol];
    if (cellInfo && cellInfo.owner && cellInfo.owner !== gameState.userId) {
      // Process the plot fee payment
      payPlotFee(PLOT_FEE, cellInfo.owner).then(success => {
        if (success) {
          toast(`Paid ${PLOT_FEE} gold plot fee to ${cellInfo.nickname || cellInfo.owner}`);
          
          // Continue with movement after successful fee payment
          setPlayer({ col: newCol, row: newRow });
          checkForTreasure(newCol, newRow);
          
          // Check if player reached exit
          if (exitCell && newCol === exitCell.col && newRow === exitCell.row) {
            toast("You reached the exit! Game complete!");
            // Would trigger game end logic
          }
        }
      });
    } else {
      // No fee required, just move
      setPlayer({ col: newCol, row: newRow });
      checkForTreasure(newCol, newRow);
      
      // Check if player reached exit
      if (exitCell && newCol === exitCell.col && newRow === exitCell.row) {
        toast("You reached the exit! Game complete!");
        // Would trigger game end logic
      }
    }
  }
  
  function checkForTreasure(col: number, row: number) {
    treasures.forEach((treasure, index) => {
      if (!treasure.collected && treasure.col === col && treasure.row === row) {
        const newTreasures = [...treasures];
        newTreasures[index].collected = true;
        setTreasures(newTreasures);
        
        // Update score
        const newScore = score + treasure.value;
        setScore(newScore);
        onScoreChange(newScore);
        
        // Collect treasure gold
        collectTreasure(treasure.value);
        toast(`Found treasure: +${treasure.value} gold!`);
      }
    });
  }

  // Handle cell click
  const handleCellClick = async (x: number, y: number) => {
    const cellCol = Math.floor(x / CELL_SIZE);
    const cellRow = Math.floor(y / CELL_SIZE);
    
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
  }, [player, gamePhase, gridCells]);

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
      <canvas
        ref={canvasRef}
        width={cols * CELL_SIZE}
        height={rows * CELL_SIZE}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) * (e.currentTarget.width / rect.width);
          const y = (e.clientY - rect.top) * (e.currentTarget.height / rect.height);
          handleCellClick(x, y);
        }}
        className="bg-gradient-to-b from-canvas-gradient-top to-canvas-gradient-bottom border-4 border-hieroglyphic-brown rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] max-w-full"
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
