
import { MazeCell, ExitCell, Treasure } from '@/types/gameTypes';

export function generateMaze(maze: MazeCell[], rows: number, cols: number): void {
  const stack: MazeCell[] = [];
  let current = maze[0];
  current.visited = true;
  
  while (true) {
    const next = checkNeighbors(current, maze, rows, cols);
    
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

function checkNeighbors(cell: MazeCell, maze: MazeCell[], rows: number, cols: number): MazeCell | undefined {
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

export function removeWalls(a: MazeCell, b: MazeCell): void {
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

export function initializeMaze(rows: number, cols: number): MazeCell[] {
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
  generateMaze(newMaze, rows, cols);
  return newMaze;
}

export function generateTreasures(rows: number, cols: number): Treasure[] {
  const newTreasures: Treasure[] = [];
  let treasureCount = Math.floor(cols * rows * 0.1); // 10% of plots have treasures
  
  while (newTreasures.length < treasureCount) {
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);
    
    if (!newTreasures.find(t => t.col === col && t.row === row)) {
      // Treasure values are in gold
      const value = Math.floor(Math.sqrt(col * col + row * row)) * 500;
      newTreasures.push({ col, row, collected: false, value });
    }
  }
  
  return newTreasures;
}

export function chooseRandomEdgeCell(rows: number, cols: number): ExitCell {
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

export function canMoveTo(player: { col: number, row: number }, targetCol: number, targetRow: number, maze: MazeCell[], cols: number, rows: number): boolean {
  if (!player) return false;
  
  if (targetCol < 0 || targetRow < 0 || targetCol >= cols || targetRow >= rows) {
    return false;
  }
  
  // Get current cell index
  const currentCellIndex = player.col + player.row * cols;
  const currentCell = maze[currentCellIndex];
  
  if (!currentCell) return false;
  
  const dx = targetCol - player.col;
  const dy = targetRow - player.row;
  
  // Only allow movement to adjacent plots
  if (Math.abs(dx) + Math.abs(dy) !== 1) return false;
  
  // Check walls
  if (dx === 1 && currentCell.walls.right) return false;
  if (dx === -1 && currentCell.walls.left) return false;
  if (dy === 1 && currentCell.walls.bottom) return false;
  if (dy === -1 && currentCell.walls.top) return false;
  
  return true;
}
