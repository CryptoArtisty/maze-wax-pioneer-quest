
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
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Game: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>('claim');
  const [phaseTime, setPhaseTime] = useState(60); // 60 seconds for claim phase
  const [score, setScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [showBuyGoldModal, setShowBuyGoldModal] = useState(false);
  const [buyAmount, setBuyAmount] = useState(1);
  const { gameState, resetPlotClaim, buyGold } = useWaxWallet();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!gameState.isAuthenticated) {
      navigate('/');
    }
  }, [gameState.isAuthenticated, navigate]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleBuyGold = async () => {
    if (buyAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const success = await buyGold(buyAmount);
    if (success) {
      setShowBuyGoldModal(false);
    }
  };

  // Game phase timer - continuously cycles through phases
  useEffect(() => {
    if (phaseTime <= 0) {
      if (gamePhase === 'claim') {
        // Transition to play phase
        setGamePhase('play');
        setPhaseTime(300); // 300 seconds for play phase
        
        if (!gameState.hasClaimedPlot) {
          toast.warning("You haven't claimed a plot! Claim a plot to participate in the next round.");
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
        
        // Reset plot claim status for next round
        resetPlotClaim();
        
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
  }, [phaseTime, gamePhase, gameState.hasClaimedPlot, gameState.currentPosition, score, resetPlotClaim]);

  return (
    <div className="min-h-screen bg-bg-dark text-gold font-medieval">
      <GameHeader onOpenDrawer={toggleDrawer} />
      
      <GameDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      <div className="flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold mt-5 mb-2">𓋹 Pyrameme Quest 𓋹</h1>
        <Button 
          onClick={() => setShowBuyGoldModal(true)}
          className="mt-5 bg-[#4a3728] hover:bg-[#6a5748] border-gold text-gold"
        >
          <Coins size={18} className="mr-2 text-yellow-400" />
          Buy Gold
        </Button>
      </div>
      
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
      
      {/* Buy Gold Modal */}
      {showBuyGoldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-dark border-2 border-gold rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Buy Gold</h2>
            <p className="mb-4">Exchange your WAXP for gold coins at a rate of 1 WAXP = 1000 gold</p>
            
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount of WAXP to spend:
                </label>
                <input 
                  type="number" 
                  min="0.1"
                  step="0.1"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-transparent border border-gold rounded text-gold"
                />
              </div>
              
              <div className="text-center">
                <p>You will receive: {buyAmount * 1000} gold</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button 
                onClick={() => setShowBuyGoldModal(false)}
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBuyGold}
                className="bg-[#4a3728] hover:bg-[#6a5748] border-gold text-gold"
              >
                Buy Gold
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer />
    </div>
  );
};

export default Game;
