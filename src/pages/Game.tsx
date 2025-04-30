
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHeader from '@/components/GameHeader';
import MazeGrid from '@/components/MazeGrid';
import GameHUD from '@/components/GameHUD';
import BottomBar from '@/components/BottomBar';
import GameDrawer from '@/components/GameDrawer';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { ToastContainer } from '@/components/ui/custom-toast';
import VictoryModal from '@/components/VictoryModal';
import { GamePhase } from '@/types/gameTypes';
import { toast } from 'sonner';

const Game: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>('claim');
  const [phaseTime, setPhaseTime] = useState(60); // 60 seconds for claim phase
  const [score, setScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const { gameState, resetCellClaim } = useWaxWallet();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!gameState.isAuthenticated) {
      navigate('/');
    }
  }, [gameState.isAuthenticated, navigate]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Game phase timer - continuously cycles through phases
  useEffect(() => {
    if (phaseTime <= 0) {
      if (gamePhase === 'claim') {
        // Transition to play phase
        setGamePhase('play');
        setPhaseTime(300); // 300 seconds for play phase
        
        if (!gameState.hasClaimedCell) {
          toast.warning("You haven't claimed a cell! Claim a cell to participate in the next round.");
        }
      } else if (gamePhase === 'play') {
        // Cycle back to claim phase for a new round
        setGamePhase('claim');
        setPhaseTime(60); // Reset to 60 seconds for claim phase
        
        // Save high score
        const currentHighScore = parseInt(localStorage.getItem('pyrameme-high-score') || '0');
        if (score > currentHighScore) {
          localStorage.setItem('pyrameme-high-score', score.toString());
        }
        
        // Show victory modal if player had a position
        if (gameState.currentPosition) {
          setIsVictoryModalOpen(true);
        }
        
        // Reset cell claim status for next round
        resetCellClaim();
        
        // Increment round number
        setRoundNumber(prev => prev + 1);
        
        // Reset score for new round
        setScore(0);
      }
      return;
    }

    const timer = setTimeout(() => {
      setPhaseTime(prevTime => prevTime - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phaseTime, gamePhase, gameState.hasClaimedCell, gameState.currentPosition, score, resetCellClaim]);

  return (
    <div className="min-h-screen bg-bg-dark text-gold font-medieval">
      <GameHeader onOpenDrawer={toggleDrawer} />
      
      <GameDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      <h1 className="text-2xl font-bold mt-5 mb-2">𓋹 Pyrameme Quest 𓋹</h1>
      
      <GameHUD 
        score={score} 
        phaseTime={phaseTime}
        gamePhase={gamePhase}
        roundNumber={roundNumber}
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
