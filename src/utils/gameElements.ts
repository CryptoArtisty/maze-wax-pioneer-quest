
import { Treasure, ExitCell } from '@/types/gameTypes';

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
