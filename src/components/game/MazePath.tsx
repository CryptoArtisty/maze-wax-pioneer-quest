
import React from 'react';
import { toast } from 'sonner';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { findPath } from '@/utils/pathfinding';
import { MazeCell, PlayerPosition, ExitCell } from '@/types/gameTypes';

interface MazePathProps {
  setHintPaths: (paths: Array<Array<[number, number]>>) => void;
  player: PlayerPosition | null;
  exitCell: ExitCell | null;
  maze: MazeCell[];
  cols: number;
  rows: number;
}

const MazePath: React.FC<MazePathProps> = ({ 
  setHintPaths, 
  player, 
  exitCell, 
  maze,
  cols,
  rows
}) => {
  const { gameState, payMovementFee } = useWaxWallet();
  const HINT_COST = 500; // 500 gold

  // Show hint paths for a few seconds
  const showHint = async () => {
    // Check if player is authenticated
    if (!gameState.isAuthenticated) {
      toast("Please connect your wallet first");
      return;
    }
    
    // Check if user has enough gold balance
    if (gameState.goldBalance < HINT_COST) {
      toast.error(`Not enough gold! Need ${HINT_COST} gold for a hint.`);
      return;
    }

    // Check if we have required data
    if (!player || !exitCell || maze.length === 0) {
      toast.error("Cannot show hint at this time.");
      return;
    }

    // Pay for hint - using null as ownerAccount means it goes to treasury
    const success = await payMovementFee(HINT_COST, null);
    if (!success) {
      toast.error("Failed to process hint payment.");
      return;
    }

    // Find path from player to exit
    console.log(`MazePath - Finding path from [${player.col},${player.row}] to [${exitCell.col},${exitCell.row}]`);
    const path = findPath(player, exitCell, maze, cols, rows);
    
    if (path.length > 0) {
      console.log("MazePath - Setting hint path:", path);
      setHintPaths([path]);
      toast.success("Hint path shown for 6 seconds");
      
      // Clear hint paths after 6 seconds
      setTimeout(() => {
        console.log("Clearing hint path");
        setHintPaths([]);
      }, 6000);
    } else {
      toast.error("Couldn't find a path to the exit.");
      // Refund would be needed here in a real application
    }
  };

  return (
    <button 
      onClick={showHint}
      className="mt-2 text-sm text-blue-400 hover:text-blue-600 underline"
    >
      Show path hint
    </button>
  );
};

export default MazePath;
