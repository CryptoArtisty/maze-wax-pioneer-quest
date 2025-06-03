
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
import GameStatusBar from '@/components/game/GameStatusBar';
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

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <div className="min-h-screen bg-bg-dark text-gold font-medieval overflow-x-auto">
      <GameHeader onOpenDrawer={toggleDrawer} />
      
      <GameDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      <GameTitle onOpenBuyGoldModal={() => setShowBuyGoldModal(true)} />
      
      <GameStatusBar 
        gamePhase={gamePhase}
        phaseTime={phaseTime}
        roundNumber={roundNumber}
      />
      
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
      
      {/* Mobile-friendly instructions */}
      <div className="text-center text-sm text-gold/70 px-4 pb-4 md:hidden">
        {gamePhase === 'claim' ? (
          <p>📱 Tap a cell to claim your starting position</p>
        ) : (
          <p>📱 Tap adjacent cells to move your red token</p>
        )}
      </div>
      
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
