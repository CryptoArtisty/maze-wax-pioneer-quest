
import { useCallback } from 'react';
import { toast } from 'sonner';
import { canMoveTo } from '@/utils/mazeUtils';
import { MazeCell, GridCell, PlayerPosition, Treasure, ExitCell } from '@/types/gameTypes';

interface UsePlayerMovementProps {
  player: PlayerPosition | null;
  setPlayer: (position: PlayerPosition) => void;
  maze: MazeCell[];
  gridCells: GridCell[][];
  treasures: Treasure[];
  setTreasures: (treasures: Treasure[]) => void;
  exitCell: ExitCell | null;
  gameState: any;
  payPlotFee: (fee: number, owner: string | null) => Promise<boolean>;
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
    
    // Check if stepping on someone else's plot - would require plot fee
    const PLOT_FEE = 50; // 50 gold plot fee
    
    const cellInfo = gridCells[newRow][newCol];
    if (cellInfo && cellInfo.owner && cellInfo.owner !== gameState.userId) {
      // Check if player has enough gold
      if (gameState.goldBalance < PLOT_FEE) {
        toast.error(`Not enough gold! Need ${PLOT_FEE} gold to move to another player's plot.`);
        return;
      }
      
      // Process the plot fee payment with visual indicator
      payPlotFee(PLOT_FEE, cellInfo.owner).then(success => {
        if (success) {
          toast(`Paid ${PLOT_FEE} gold plot fee to ${cellInfo.nickname || cellInfo.owner}`);
          
          // Continue with movement after successful fee payment
          setPlayer({ col: newCol, row: newRow });
          checkForTreasure(newCol, newRow);
          
          // Check if player reached exit
          if (exitCell && newCol === exitCell.col && newRow === exitCell.row) {
            toast("You reached the exit! Game complete!");
            // Would trigger game end logic
          }
        }
      });
    } else {
      // No fee required, just move
      setPlayer({ col: newCol, row: newRow });
      checkForTreasure(newCol, newRow);
      
      // Check if player reached exit
      if (exitCell && newCol === exitCell.col && newRow === exitCell.row) {
        toast("You reached the exit! Game complete!");
        // Would trigger game end logic
      }
    }
  }, [player, maze, gridCells, gameState.userId, gameState.goldBalance, payPlotFee, setPlayer, checkForTreasure, exitCell, cols, rows]);

  return { movePlayer };
}
