
import { MazeCell, Treasure, ExitCell, PlayerPosition } from '@/types/gameTypes';

interface MazeRendererProps {
  ctx: CanvasRenderingContext2D;
  cellSize: number;
  maze: MazeCell[];
  treasures: Treasure[];
  exitCell: ExitCell | null;
  player: PlayerPosition | null;
}

export class MazeRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private maze: MazeCell[];
  private treasures: Treasure[];
  private exitCell: ExitCell | null;
  private player: PlayerPosition | null;

  constructor(props: MazeRendererProps) {
    this.ctx = props.ctx;
    this.cellSize = props.cellSize;
    this.maze = props.maze;
    this.treasures = props.treasures;
    this.exitCell = props.exitCell;
    this.player = props.player;
  }

  draw() {
    // Draw maze walls
    this.maze.forEach(cell => {
      const x = cell.col * this.cellSize, y = cell.row * this.cellSize;
      this.ctx.strokeStyle = "#00ffff"; // Maze wall color
      this.ctx.lineWidth = 4;
      
      if (cell.walls.top) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + this.cellSize, y);
        this.ctx.stroke();
      }
      
      if (cell.walls.right) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.cellSize, y);
        this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        this.ctx.stroke();
      }
      
      if (cell.walls.bottom) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.cellSize, y + this.cellSize);
        this.ctx.lineTo(x, y + this.cellSize);
        this.ctx.stroke();
      }
      
      if (cell.walls.left) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + this.cellSize);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
      }
    });
    
    // Draw treasures
    this.treasures.forEach(t => {
      if (!t.collected) {
        this.ctx.fillStyle = "gold";
        this.ctx.beginPath();
        this.ctx.arc(
          t.col * this.cellSize + this.cellSize / 2, 
          t.row * this.cellSize + this.cellSize / 2, 
          this.cellSize * 0.2, 
          0, 
          Math.PI * 2
        );
        this.ctx.fill();
      }
    });
    
    // Draw exit
    if (this.exitCell) {
      this.ctx.fillStyle = "green";
      this.ctx.fillRect(
        this.exitCell.col * this.cellSize + this.cellSize * 0.2, 
        this.exitCell.row * this.cellSize + this.cellSize * 0.2, 
        this.cellSize * 0.6, 
        this.cellSize * 0.6
      );
    }
    
    // Draw player
    if (this.player) {
      this.ctx.fillStyle = "red";
      this.ctx.fillRect(
        this.player.col * this.cellSize + this.cellSize * 0.2, 
        this.player.row * this.cellSize + this.cellSize * 0.2, 
        this.cellSize * 0.6, 
        this.cellSize * 0.6
      );
    }
  }
}
