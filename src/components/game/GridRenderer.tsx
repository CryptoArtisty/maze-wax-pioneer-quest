
import { GridCell } from '@/types/gameTypes';

interface GridRendererProps {
  ctx: CanvasRenderingContext2D;
  rows: number;
  cols: number;
  cellSize: number;
  gridCells: GridCell[][];
}

export class GridRenderer {
  private ctx: CanvasRenderingContext2D;
  private rows: number;
  private cols: number;
  private cellSize: number;
  private gridCells: GridCell[][];

  constructor(props: GridRendererProps) {
    this.ctx = props.ctx;
    this.rows = props.rows;
    this.cols = props.cols;
    this.cellSize = props.cellSize;
    this.gridCells = props.gridCells;
  }

  draw() {
    // Set styles for grid lines
    this.ctx.strokeStyle = "rgba(255,215,0,0.3)"; // Grid line color
    this.ctx.lineWidth = 1;
    
    // Draw vertical grid lines
    for (let c = 0; c <= this.cols; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * this.cellSize, 0);
      this.ctx.lineTo(c * this.cellSize, this.rows * this.cellSize);
      this.ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let r = 0; r <= this.rows; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * this.cellSize);
      this.ctx.lineTo(this.cols * this.cellSize, r * this.cellSize);
      this.ctx.stroke();
    }
    
    // Draw claimed plots - now with just one checkmark
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.gridCells[r] && this.gridCells[r][c] && this.gridCells[r][c].owner) {
          // Add a subtle background to claimed plots
          this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          this.ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
          
          // Draw a single checkmark
          this.ctx.font = `bold ${this.cellSize / 2}px sans-serif`;
          this.ctx.fillStyle = "#FFD700"; // Gold color
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText("✓", c * this.cellSize + this.cellSize / 2, r * this.cellSize + this.cellSize / 2);
        }
      }
    }
  }
}
