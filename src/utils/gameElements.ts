
import { Treasure, ExitCell } from '@/types/gameTypes';

export function generateTreasures(rows: number, cols: number, treasuryBalance: number): Treasure[] {
  const newTreasures: Treasure[] = [];
  let treasureCount = Math.floor(cols * rows * 0.1); // 10% of plots have treasures
  
  // Calculate total reward pool (50% of treasury)
  const totalRewardPool = Math.floor(treasuryBalance * 0.5);
  
  // If the treasury is empty, generate minimal treasures
  if (totalRewardPool <= 0) {
    treasureCount = Math.min(3, treasureCount); // Limit to max 3 treasures if treasury is empty
  }
  
  // Create treasures with balanced values
  const positions: Array<[number, number]> = [];
  
  // Generate random positions first
  while (positions.length < treasureCount) {
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);
    
    // Check if this position is already used
    if (!positions.find(pos => pos[0] === col && pos[1] === row)) {
      positions.push([col, row]);
    }
  }
  
  // Sort positions by distance from center (0,0) for value assignment
  positions.sort((a, b) => {
    const distA = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    const distB = Math.sqrt(b[0] * b[0] + b[1] * b[1]);
    return distB - distA; // Further = more valuable
  });
  
  // Distribute reward pool among treasures
  let remainingReward = totalRewardPool;
  
  positions.forEach((pos, index) => {
    const [col, row] = pos;
    
    // Last treasure gets remaining amount, others get weighted portions
    let value;
    if (index === positions.length - 1) {
      value = remainingReward;
    } else {
      // Weight by position in the sorted list (further from center = more valuable)
      const weight = (positions.length - index) / positions.length;
      value = Math.floor(totalRewardPool * weight * (1 / positions.length));
      
      // Ensure minimum value of 50 gold per treasure
      value = Math.max(50, value);
      
      // Don't exceed remaining reward
      value = Math.min(remainingReward, value);
      
      remainingReward -= value;
    }
    
    // Add the treasure with calculated value
    newTreasures.push({ col, row, collected: false, value });
  });
  
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
