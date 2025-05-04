
import { MazeCell, PlayerPosition, ExitCell } from '@/types/gameTypes';
import { canMoveTo } from './playerMovement';

// Fixed pathfinding function to find path from player to exit
export function findPath(
  player: PlayerPosition, 
  exitCell: ExitCell, 
  maze: MazeCell[], 
  cols: number, 
  rows: number
): Array<[number, number]> {
  // Create grid for pathfinding
  const grid: any[][] = [];
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      grid[i][j] = {
        x: j,
        y: i,
        g: 0,
        h: 0,
        f: 0,
        visited: false,
        closed: false,
        parent: null
      };
    }
  }

  // Start and end points
  const start = grid[player.row][player.col];
  const end = grid[exitCell.row][exitCell.col];
  
  // Add logging for debugging
  console.log(`Pathfinding from player [${player.col},${player.row}] to exit [${exitCell.col},${exitCell.row}]`);
  
  // Open nodes to examine (priority queue)
  const openNodes = [start];
  start.visited = true;
  
  // Process nodes until path found or no path exists
  while (openNodes.length > 0) {
    // Find node with lowest f score
    let currentIndex = 0;
    for (let i = 0; i < openNodes.length; i++) {
      if (openNodes[i].f < openNodes[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    // Get current node
    const currentNode = openNodes[currentIndex];
    
    // Check if we reached the end
    if (currentNode.x === end.x && currentNode.y === end.y) {
      // Trace path back to start
      const path: Array<[number, number]> = [];
      let current = currentNode;
      while (current.parent) {
        path.push([current.x, current.y]);
        current = current.parent;
      }
      // Return the path reversed (from start to end)
      return path.reverse();
    }
    
    // Move current node from open to closed
    openNodes.splice(currentIndex, 1);
    currentNode.closed = true;
    
    // Check all neighbors
    const directions = [
      { x: 0, y: -1 },  // top
      { x: 1, y: 0 },   // right
      { x: 0, y: 1 },   // bottom
      { x: -1, y: 0 }   // left
    ];
    
    for (const dir of directions) {
      const x = currentNode.x + dir.x;
      const y = currentNode.y + dir.y;
      
      // Skip if out of bounds
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      
      // Check walls using canMoveTo
      if (!canMoveTo({col: currentNode.x, row: currentNode.y}, x, y, maze, cols, rows)) {
        continue;
      }
      
      const neighbor = grid[y][x];
      
      // Skip if closed
      if (neighbor.closed) continue;
      
      // Calculate g score (distance from start)
      const gScore = currentNode.g + 1;
      
      // If not in open set or better path found
      if (!neighbor.visited || gScore < neighbor.g) {
        neighbor.parent = currentNode;
        neighbor.g = gScore;
        neighbor.h = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y); // Manhattan distance
        neighbor.f = neighbor.g + neighbor.h;
        
        if (!neighbor.visited) {
          neighbor.visited = true;
          openNodes.push(neighbor);
        }
      }
    }
  }
  
  // If no path found, try to find a path ignoring walls (for debugging/hint purposes)
  console.log("No direct path found, attempting to find any navigable path");
  
  // Simple BFS without wall constraints
  const simplePath = findAnyPath(player, exitCell, cols, rows);
  if (simplePath.length > 0) {
    console.log("Found approximate path (ignoring some walls):", simplePath);
    return simplePath;
  }
  
  // No path found
  console.log("No path found at all");
  return [];
}

// Fallback pathfinding that ignores walls (in case normal pathfinding fails)
function findAnyPath(
  player: PlayerPosition,
  exitCell: ExitCell,
  cols: number,
  rows: number
): Array<[number, number]> {
  // Create grid for BFS pathfinding
  const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const parent: [number, number][][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
  
  // BFS queue
  const queue: [number, number][] = [[player.col, player.row]];
  visited[player.row][player.col] = true;
  
  // Directions: up, right, down, left
  const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  
  while (queue.length > 0) {
    const [currentCol, currentRow] = queue.shift()!;
    
    // Check if reached target
    if (currentCol === exitCell.col && currentRow === exitCell.row) {
      // Reconstruct path
      const path: Array<[number, number]> = [];
      let current: [number, number] = [currentCol, currentRow];
      
      // Don't include the starting position in the path
      while (current[0] !== player.col || current[1] !== player.row) {
        path.push(current);
        current = parent[current[1]][current[0]];
      }
      
      return path.reverse();
    }
    
    // Try all four directions
    for (const [dx, dy] of directions) {
      const newCol = currentCol + dx;
      const newRow = currentRow + dy;
      
      // Check if in bounds and not visited
      if (newCol >= 0 && newCol < cols && 
          newRow >= 0 && newRow < rows && 
          !visited[newRow][newCol]) {
        visited[newRow][newCol] = true;
        parent[newRow][newCol] = [currentCol, currentRow];
        queue.push([newCol, newRow]);
      }
    }
  }
  
  return [];
}
