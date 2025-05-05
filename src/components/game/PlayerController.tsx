
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { usePlayerMovement } from '@/hooks/usePlayerMovement';
import { PlayerPosition, Treasure, ExitCell, MazeCell, GridCell } from '@/types/gameTypes';
import { GameState } from '@/types/waxTypes';

interface PlayerControllerProps {
  player: PlayerPosition | null;
  setPlayer: (position: PlayerPosition) => void;
  maze: MazeCell[];
  gridCells: GridCell[][];
  treasures: Treasure[];
  setTreasures: (treasures: Treasure[]) => void;
  exitCell: ExitCell | null;
  gameState: GameState;
  gamePhase: 'claim' | 'play';
  rows: number;
  cols: number;
  onScoreChange: (score: number) => void;
  payPlotFee: (fee: number, owner: string | null) => Promise<boolean>;
  payMovementFee: (fee: number, owner: string | null) => Promise<boolean>;
  collectTreasure: (value: number) => Promise<boolean>;
}

const PlayerController: React.FC<PlayerControllerProps> = ({
  player,
  setPlayer,
  maze,
  gridCells,
  treasures,
  setTreasures,
  exitCell,
  gameState,
  gamePhase,
  rows,
  cols,
  onScoreChange,
  payPlotFee,
  payMovementFee,
  collectTreasure
}) => {
  const [score, setScore] = React.useState(0);

  // Setup player movement hook
  const { movePlayer } = usePlayerMovement({
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
  });

  // Update parent component when score changes
  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  // Handle keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhase !== 'play' || !player) return;
      
      // Check if the player has claimed a plot before allowing movement
      if (!gameState.hasClaimedPlot) {
        toast.error("You must claim a cell during the claim phase before you can play!");
        return;
      }
      
      let newCol = player.col;
      let newRow = player.row;
      
      switch (e.key) {
        case 'ArrowUp':
          newRow--;
          break;
        case 'ArrowDown':
          newRow++;
          break;
        case 'ArrowLeft':
          newCol--;
          break;
        case 'ArrowRight':
          newCol++;
          break;
        default:
          return;
      }
      
      movePlayer(newCol, newRow);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, gamePhase, movePlayer, gameState.hasClaimedPlot]);

  return null; // This is a controller component with no UI
};

export default PlayerController;
