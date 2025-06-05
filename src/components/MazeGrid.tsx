
import React from 'react';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { GamePhase } from '@/types/gameTypes';
import GameCanvas from '@/components/game/GameCanvas';
import { useGridInitializer } from '@/hooks/useGridInitializer';
import PlayerController from '@/components/game/PlayerController';
import { useCellHandler } from '@/components/game/CellHandler';
import MazePath from '@/components/game/MazePath';
import { findPath } from '@/utils/pathfinding';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface MazeGridProps {
  rows: number;
  cols: number;
  gamePhase: GamePhase;
  onScoreChange: (score: number) => void;
}

const MazeGrid: React.FC<MazeGridProps> = ({ rows, cols, gamePhase, onScoreChange }) => {
  const { gameState, claimPlot, payPlotFee, payMovementFee, collectTreasure } = useWaxWallet();

  // Initialize grid state using our custom hook
  const {
    gridCells,
    maze,
    player,
    treasures,
    exitCell,
    hintPaths,
    setGridCells,
    setPlayer,
    setTreasures,
    setHintPaths
  } = useGridInitializer({ rows, cols, gamePhase, gameState });

  // Reference to store the movePlayer function from PlayerController
  const movePlayerRef = React.useRef<(col: number, row: number) => void>();

  // Callback to receive movePlayer function from PlayerController
  const handleMovePlayerRef = React.useCallback((movePlayerFn: (col: number, row: number) => void) => {
    movePlayerRef.current = movePlayerFn;
  }, []);

  // Use CellHandler to manage cell click interactions
  const { handleCellClick } = useCellHandler({
    gridCells,
    setGridCells,
    gameState,
    gamePhase,
    claimPlot,
    movePlayer: (col, row) => {
      if (gamePhase === 'play' && movePlayerRef.current) {
        movePlayerRef.current(col, row);
      }
    },
    cols,
    rows,
    cellSize: Math.max(20, Math.min(40, Math.floor((window.innerWidth - 32) / cols))) // Dynamic cell size calculation
  });
  
  // Add event listener for hint button
  React.useEffect(() => {
    const hintHandler = () => {
      if (player && exitCell && maze.length > 0) {
        console.log(`Handling hint event - finding path from [${player.col},${player.row}] to [${exitCell.col},${exitCell.row}]`);
        
        const path = findPath(player, exitCell, maze, cols, rows);
        console.log("Path found:", path);
        
        if (path && path.length > 0) {
          setHintPaths([path]);
          
          // Clear hint paths after 6 seconds
          setTimeout(() => {
            console.log("Clearing hint path after timeout");
            setHintPaths([]);
          }, 6000);
        } else {
          console.error("No path found between player and exit");
        }
      } else {
        console.error("Missing required data for hint path:", 
          { playerExists: !!player, exitCellExists: !!exitCell, mazeLength: maze.length });
      }
    };

    window.addEventListener('show-maze-hint', hintHandler);
    return () => window.removeEventListener('show-maze-hint', hintHandler);
  }, [player, exitCell, maze, cols, rows, setHintPaths]);
  
  const handleHint = async () => {
    const HINT_COST = 500;
    
    // Check if user is authenticated
    if (!gameState.isAuthenticated) {
      toast("Please connect your wallet first");
      return;
    }
    
    // Check if user has enough gold balance
    if (gameState.goldBalance < HINT_COST) {
      toast.error(`Not enough gold! Need ${HINT_COST} gold for a hint.`);
      return;
    }
    
    // Pay for hint - send to treasury (null owner)
    const success = await payMovementFee(HINT_COST, null);
    if (!success) {
      toast.error("Failed to process hint payment.");
      return;
    }
    
    // Create and dispatch a custom event to trigger the hint functionality
    console.log("MazeGrid - Dispatching show-maze-hint event");
    const hintEvent = new CustomEvent('show-maze-hint');
    window.dispatchEvent(hintEvent);
    
    toast.success(`Used ${HINT_COST} gold for hint`);
  };
  
  const handleShare = async () => {
    const shareData = {
      title: 'Pyrameme Quest Saga',
      text: `I'm playing Pyrameme Quest Saga! Check it out!`,
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
        toast('Copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Player controller handles movement logic but renders nothing visually */}
      {gamePhase === 'play' && player && (
        <PlayerController
          player={player}
          setPlayer={setPlayer}
          maze={maze}
          gridCells={gridCells}
          treasures={treasures}
          setTreasures={setTreasures}
          exitCell={exitCell}
          gameState={gameState}
          gamePhase={gamePhase}
          rows={rows}
          cols={cols}
          onScoreChange={onScoreChange}
          payPlotFee={payPlotFee}
          payMovementFee={payMovementFee}
          collectTreasure={collectTreasure}
          onMovePlayerRef={handleMovePlayerRef}
        />
      )}

      {/* Fixed container for the game canvas */}
      <div className="w-full max-w-[min(95vw,600px)] aspect-square flex items-center justify-center px-2 mb-4">
        <GameCanvas 
          rows={rows}
          cols={cols}
          gridCells={gridCells}
          maze={maze}
          player={player}
          treasures={treasures}
          exitCell={exitCell}
          hintPaths={hintPaths}
          gamePhase={gamePhase}
          onCellClick={handleCellClick}
        />
      </div>
      
      {/* Action buttons below the grid */}
      <div className="w-full max-w-md flex flex-col gap-2 px-4 mb-4">
        <Button 
          onClick={handleHint}
          className="w-full py-4 bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
        >
          Hint (500 Gold)
        </Button>
        
        <Button 
          onClick={handleShare}
          className="w-full py-4 bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
        >
          𓀣 Share Your Victory
        </Button>
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground px-4">
        {gamePhase === 'claim' ? (
          <p>Click on a plot to claim your starting position</p>
        ) : (
          <div className="flex flex-col items-center">
            {!gameState.hasClaimedPlot ? (
              <p className="text-red-500">You must claim a cell during the claim phase before you can play!</p>
            ) : player ? (
              <>
                <p>Your claimed plot: [{player.col}, {player.row}]</p>
                <MazePath 
                  setHintPaths={setHintPaths} 
                  player={player}
                  exitCell={exitCell}
                  maze={maze}
                  rows={rows}
                  cols={cols}
                />
              </>
            ) : (
              <p>No position set</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MazeGrid;
