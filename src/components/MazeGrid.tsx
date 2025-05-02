
import React from 'react';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { GamePhase } from '@/types/gameTypes';
import GameCanvas from '@/components/game/GameCanvas';
import { useGridInitializer } from '@/hooks/useGridInitializer';
import PlayerController from '@/components/game/PlayerController';
import { useCellHandler } from '@/components/game/CellHandler';
import MazePath from '@/components/game/MazePath';

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
            <p>
              {player ? 
                `Your position: [${player.col}, ${player.row}]` : 
                "No position set"
              }
            </p>
            <MazePath setHintPaths={setHintPaths} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MazeGrid;
