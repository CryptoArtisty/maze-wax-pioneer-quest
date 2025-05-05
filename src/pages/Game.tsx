
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHeader from '@/components/GameHeader';
import BottomBar from '@/components/BottomBar';
import GameDrawer from '@/components/GameDrawer';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { ToastContainer } from '@/components/ui/custom-toast';
import VictoryModal from '@/components/VictoryModal';
import GameHUD from '@/components/GameHUD';
import BuyGoldModal from '@/components/game/BuyGoldModal';
import GameTitle from '@/components/game/GameTitle';
import GameContent from '@/components/game/GameContent';
import { useGamePhase } from '@/hooks/useGamePhase';

const Game: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [showBuyGoldModal, setShowBuyGoldModal] = useState(false);
  const { gameState } = useWaxWallet();
  const navigate = useNavigate();
  
  const { gamePhase, phaseTime } = useGamePhase(
    score,
    roundNumber,
    setRoundNumber,
    setScore,
    setIsVictoryModalOpen
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!gameState.isAuthenticated) {
      navigate('/');
    }
  }, [gameState.isAuthenticated, navigate]);

  // Listen for player reaching exit
  useEffect(() => {
    const handlePlayerReachedExit = (event: CustomEvent) => {
      // Show victory modal
      setScore(event.detail.score);
      setIsVictoryModalOpen(true);
    };

    // Listen for confetti trigger event
    const handleTriggerConfetti = () => {
      // Create confetti elements
      const confettiCount = 150;
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
      
      // Create confetti pieces
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.position = 'absolute';
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.backgroundColor = color;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.top = '0';
        confetti.style.left = `${Math.random() * 100}vw`;
        
        // Animation
        confetti.style.transform = 'translateY(0)';
        confetti.style.opacity = '1';
        confetti.style.transition = `all ${Math.random() * 3 + 2}s ease-out`;
        
        container.appendChild(confetti);
        
        // Animate confetti
        setTimeout(() => {
          confetti.style.transform = `translateY(100vh) rotate(${Math.random() * 1000}deg)`;
          confetti.style.opacity = '0';
        }, 10);
        
        // Remove confetti after animation
        setTimeout(() => {
          confetti.remove();
        }, 5000);
      }
      
      // Remove container after all confetti is gone
      setTimeout(() => {
        container.remove();
      }, 5100);
    };
    
    window.addEventListener('player-reached-exit', handlePlayerReachedExit as EventListener);
    window.addEventListener('trigger-confetti', handleTriggerConfetti);
    
    return () => {
      window.removeEventListener('player-reached-exit', handlePlayerReachedExit as EventListener);
      window.removeEventListener('trigger-confetti', handleTriggerConfetti);
    };
  }, []);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <div className="min-h-screen bg-bg-dark text-gold font-medieval">
      <GameHeader onOpenDrawer={toggleDrawer} />
      
      <GameDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      <GameTitle onOpenBuyGoldModal={() => setShowBuyGoldModal(true)} />
      
      <GameHUD 
        score={score} 
        phaseTime={phaseTime}
        gamePhase={gamePhase}
        roundNumber={roundNumber}
      />
      
      <GameContent 
        gamePhase={gamePhase}
        onScoreChange={setScore}
      />
      
      <BottomBar />
      
      <VictoryModal 
        isOpen={isVictoryModalOpen}
        onClose={() => setIsVictoryModalOpen(false)}
        score={score}
      />
      
      <BuyGoldModal
        isOpen={showBuyGoldModal}
        onClose={() => setShowBuyGoldModal(false)}
      />
      
      <ToastContainer />
    </div>
  );
};

export default Game;
