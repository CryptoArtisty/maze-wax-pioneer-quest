
import { Treasure, ExitCell } from '@/types/gameTypes';

export function generateTreasures(rows: number, cols: number, treasuryBalance: number): Treasure[] {
  const newTreasures: Treasure[] = [];
  let treasureCount = Math.floor(cols * rows * 0.1); // 10% of plots have treasures
  
  // Calculate total reward amount (50% of treasury balance)
  const totalRewardAmount = Math.floor(treasuryBalance * 0.5);
  
  // Prevent division by zero
  if (treasureCount === 0) treasureCount = 1;
  
  // Calculate average treasure value
  const averageValue = Math.floor(totalRewardAmount / treasureCount);
  
  while (newTreasures.length < treasureCount) {
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);
    
    if (!newTreasures.find(t => t.col === col && t.row === row)) {
      // Treasure values vary based on distance from center
      // but total should equal totalRewardAmount
      const distanceFactor = Math.sqrt(col * col + row * row) / Math.sqrt(cols * cols + rows * rows);
      let value = Math.floor(averageValue * (0.5 + distanceFactor));
      
      // Ensure we don't exceed total reward amount
      const currentTotal = newTreasures.reduce((sum, t) => sum + t.value, 0);
      if (newTreasures.length === treasureCount - 1) {
        // Last treasure, adjust to hit exact total
        value = totalRewardAmount - currentTotal;
        if (value <= 0) value = 10; // Minimum treasure value
      } else if (currentTotal + value > totalRewardAmount) {
        value = totalRewardAmount - currentTotal;
        if (value <= 0) break; // Stop adding treasures if we hit the limit
      }
      
      newTreasures.push({ col, row, collected: false, value });
    }
  }
  
  console.log(`Generated ${newTreasures.length} treasures with total value ${newTreasures.reduce((sum, t) => sum + t.value, 0)} gold`);
  
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
