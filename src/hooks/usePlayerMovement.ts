
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { canMoveTo } from '@/utils/playerMovement';
import { MazeCell, GridCell, PlayerPosition, Treasure, ExitCell } from '@/types/gameTypes';
import { GameState } from '@/types/waxTypes';

interface UsePlayerMovementProps {
  player: PlayerPosition | null;
  setPlayer: (position: PlayerPosition) => void;
  maze: MazeCell[];
  gridCells: GridCell[][];
  treasures: Treasure[];
  setTreasures: (treasures: Treasure[]) => void;
  exitCell: ExitCell | null;
  gameState: GameState;
  payPlotFee: (fee: number, owner: string | null) => Promise<boolean>;
  payMovementFee: (fee: number, owner: string | null) => Promise<boolean>;
  collectTreasure: (value: number) => Promise<boolean>;
  score: number;
  setScore: (score: number) => void;
  onScoreChange: (score: number) => void;
  rows: number;
  cols: number;
}

export function usePlayerMovement({
  player,
  setPlayer,
  maze,
  gridCells,
  treasures,
  setTreasures,
  exitCell,
  gameState,
  payPlotFee,
  payMovementFee,
  collectTreasure,
  score,
  setScore,
  onScoreChange,
  rows,
  cols
}: UsePlayerMovementProps) {
  const checkForTreasure = useCallback((col: number, row: number) => {
    treasures.forEach((treasure, index) => {
      if (!treasure.collected && treasure.col === col && treasure.row === row) {
        const newTreasures = [...treasures];
        newTreasures[index].collected = true;
        setTreasures(newTreasures);
        
        // Update score
        const newScore = score + treasure.value;
        setScore(newScore);
        onScoreChange(newScore);
        
        // Collect treasure gold with visual feedback
        collectTreasure(treasure.value);
        toast(`Found treasure: +${treasure.value} gold!`);
      }
    });
  }, [treasures, setTreasures, score, setScore, onScoreChange, collectTreasure]);

  const movePlayer = useCallback((newCol: number, newRow: number) => {
    if (!player) {
      toast("No player position set!");
      return;
    }
    
    if (!canMoveTo(player, newCol, newRow, maze, cols, rows)) {
      toast("Blocked!");
      return;
    }
    
    const MOVEMENT_FEE = 50; // 50 gold movement fee
    const cellInfo = gridCells[newRow][newCol];
    
    // Check if trying to move to own plot (no fee) or other's/unowned plot (fee required)
    const isOwnPlot = cellInfo && cellInfo.owner === gameState.userId;
    
    // If not own plot, charge movement fee
    if (!isOwnPlot) {
      // Check if player has enough gold
      if (gameState.goldBalance < MOVEMENT_FEE) {
        toast.error(`Not enough gold! Need ${MOVEMENT_FEE} gold to move to this plot.`);
        return;
      }
      
      // Process the movement fee payment with visual indicator
      payMovementFee(MOVEMENT_FEE, cellInfo?.owner || null).then(success => {
        if (success) {
          const ownerText = cellInfo?.owner 
            ? `${cellInfo.nickname || cellInfo.owner}` 
            : "treasury";
          
          toast(`Paid ${MOVEMENT_FEE} gold movement fee to ${ownerText}`);
          
          // Continue with movement after successful fee payment
          setPlayer({ col: newCol, row: newRow });
          checkForTreasure(newCol, newRow);
          
          // Check if player reached exit
          if (exitCell && newCol === exitCell.col && newRow === exitCell.row) {
            toast("You reached the exit! Game complete!");
          }
        }
      });
    } else {
      // No fee required for own plot, just move
      setPlayer({ col: newCol, row: newRow });
      checkForTreasure(newCol, newRow);
      
      // Check if player reached exit
      if (exitCell && newCol === exitCell.col && newRow === exitCell.row) {
        toast("You reached the exit! Game complete!");
      }
    }
  }, [player, maze, gridCells, gameState.userId, gameState.goldBalance, payMovementFee, setPlayer, checkForTreasure, exitCell, cols, rows]);

  return { movePlayer };
}
