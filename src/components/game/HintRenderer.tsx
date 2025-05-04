
interface HintRendererProps {
  ctx: CanvasRenderingContext2D;
  cellSize: number;
  hintPaths: Array<Array<[number, number]>>;
}

export class HintRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private hintPaths: Array<Array<[number, number]>>;

  constructor(props: HintRendererProps) {
    this.ctx = props.ctx;
    this.cellSize = props.cellSize;
    this.hintPaths = props.hintPaths;
  }

  draw() {
    if (!this.hintPaths.length) return;
    
    this.ctx.fillStyle = "rgba(0,255,255,0.4)"; // Hint path color (made more visible)
    
    this.hintPaths.forEach(path => {
      path.forEach(([col, row]) => {
        // Draw a filled rectangle for each cell in the hint path
        this.ctx.fillRect(
          col * this.cellSize + this.cellSize * 0.1, 
          row * this.cellSize + this.cellSize * 0.1, 
          this.cellSize * 0.8, 
          this.cellSize * 0.8
        );
      });
    });
    
    // Add arrow indicators along the path
    this.hintPaths.forEach(path => {
      if (path.length > 1) {
        this.ctx.strokeStyle = "rgba(255,255,0,0.7)";
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < path.length - 1; i++) {
          const [x1, y1] = path[i];
          const [x2, y2] = path[i + 1];
          
          // Draw arrow from current cell to next cell
          const startX = x1 * this.cellSize + this.cellSize / 2;
          const startY = y1 * this.cellSize + this.cellSize / 2;
          const endX = x2 * this.cellSize + this.cellSize / 2;
          const endY = y2 * this.cellSize + this.cellSize / 2;
          
          // Draw line
          this.ctx.beginPath();
          this.ctx.moveTo(startX, startY);
          this.ctx.lineTo(endX, endY);
          this.ctx.stroke();
          
          // Draw arrowhead
          const angle = Math.atan2(endY - startY, endX - startX);
          const arrowSize = this.cellSize / 5;
          
          this.ctx.beginPath();
          this.ctx.moveTo(endX, endY);
          this.ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          this.ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          this.ctx.closePath();
          this.ctx.fillStyle = "rgba(255,255,0,0.7)";
          this.ctx.fill();
        }
      }
    });
  }
}
