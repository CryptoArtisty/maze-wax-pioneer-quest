
import React from 'react';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { GamePhase } from '@/types/gameTypes';
import GameCanvas from '@/components/game/GameCanvas';
import { useGridInitializer } from '@/hooks/useGridInitializer';
import PlayerController from '@/components/game/PlayerController';
import { useCellHandler } from '@/components/game/CellHandler';
import MazePath from '@/components/game/MazePath';
import { findPath } from '@/utils/pathfinding';

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

  // Use CellHandler to manage cell click interactions
  const { handleCellClick } = useCellHandler({
    gridCells,
    setGridCells,
    gameState,
    gamePhase,
    claimPlot,
    movePlayer: (col, row) => {
      if (gamePhase === 'play' && player) {
        // This will be handled by the PlayerController which has the movePlayer function
        const event = new CustomEvent('maze-move-player', { 
          detail: { col, row } 
        });
        window.dispatchEvent(event);
      }
    },
    cols,
    rows
  });

  // Custom event handler for player movement
  React.useEffect(() => {
    const moveHandler = (e: CustomEvent) => {
      if (playerControllerMovePlayer.current) {
        playerControllerMovePlayer.current(e.detail.col, e.detail.row);
      }
    };

    window.addEventListener('maze-move-player', moveHandler as EventListener);
    return () => window.removeEventListener('maze-move-player', moveHandler as EventListener);
  }, []);
  
  // Add event listener for hint button in BottomBar
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
  
  // Reference to the movePlayer function from PlayerController
  const playerControllerMovePlayer = React.useRef<(col: number, row: number) => void>();
  
  // Capture the movePlayer function from PlayerMovement hook
  const setMovePlayerRef = (movePlayerFn: (col: number, row: number) => void) => {
    playerControllerMovePlayer.current = movePlayerFn;
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
        />
      )}

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
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {gamePhase === 'claim' ? (
          <p>Click on a plot to claim your starting position</p>
        ) : (
          <div className="flex flex-col items-center">
            {!gameState.hasClaimedPlot ? (
              <p className="text-red-500">You must claim a cell during the claim phase before you can play!</p>
            ) : player ? (
              <>
                <p>Your position: [{player.col}, {player.row}]</p>
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
