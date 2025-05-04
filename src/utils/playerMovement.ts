
import { MazeCell } from '@/types/gameTypes';

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
