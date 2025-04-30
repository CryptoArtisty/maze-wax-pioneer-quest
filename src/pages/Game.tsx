
import React, { useState, useEffect } from 'react';
import GameHeader from '@/components/GameHeader';
import MazeGrid from '@/components/MazeGrid';
import GameHUD from '@/components/GameHUD';
import BottomBar from '@/components/BottomBar';
import GameDrawer from '@/components/GameDrawer';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { ToastContainer } from '@/components/ui/custom-toast';
import VictoryModal from '@/components/VictoryModal';
import { GamePhase } from '@/types/gameTypes';

const Game: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>('claim');
  const [phaseTime, setPhaseTime] = useState(60);
  const [score, setScore] = useState(0);
  const { gameState } = useWaxWallet();

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Reset timer when game phase changes
  useEffect(() => {
    if (gamePhase === 'claim') {
      setPhaseTime(60); // 60 seconds for claim phase
    } else if (gamePhase === 'play') {
      setPhaseTime(300); // 300 seconds for play phase
    }
  }, [gamePhase]);

  // Phase timer
  useEffect(() => {
    if (phaseTime <= 0) {
      if (gamePhase === 'claim') {
        // Only transition to play phase if user has claimed a cell
        if (gameState.hasClaimedCell) {
          setGamePhase('play');
        } else {
          // Reset claim phase if no cell was claimed
          setPhaseTime(60);
        }
      } else if (gamePhase === 'play') {
        // End game when play phase ends
        setIsVictoryModalOpen(true);
      }
      return;
    }

    const timer = setTimeout(() => {
      setPhaseTime(prevTime => prevTime - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phaseTime, gamePhase, gameState.hasClaimedCell]);

  return (
    <div className="min-h-screen bg-bg-dark text-gold font-medieval">
      <GameHeader onOpenDrawer={toggleDrawer} />
      
      <GameDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      <h1 className="text-2xl font-bold mt-5 mb-2">𓋹 Pyrameme Quest 𓋹</h1>
      
      <GameHUD 
        score={score} 
        phaseTime={phaseTime}
        gamePhase={gamePhase} 
      />
      
      <main className="container mx-auto px-4 py-6">
        <MazeGrid 
          rows={15} 
          cols={15} 
          gamePhase={gamePhase}
          onScoreChange={setScore}
        />
      </main>
      
      <BottomBar />
      
      <VictoryModal 
        isOpen={isVictoryModalOpen}
        onClose={() => setIsVictoryModalOpen(false)}
        score={score}
      />
      
      <ToastContainer />
    </div>
  );
};

export default Game;
