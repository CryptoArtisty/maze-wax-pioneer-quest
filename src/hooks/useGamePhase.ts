
import { useState, useEffect } from 'react';
import { GamePhase } from '@/types/gameTypes';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { toast } from 'sonner';

export function useGamePhase(
  score: number,
  roundNumber: number, 
  setRoundNumber: (num: number) => void,
  setScore: (score: number) => void,
  setIsVictoryModalOpen: (isOpen: boolean) => void
) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('claim');
  const [phaseTime, setPhaseTime] = useState(20); // 20 seconds for claim phase (reduced from 60)
  const { gameState, resetPlotClaim } = useWaxWallet();

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
        setPhaseTime(20); // Reset to 20 seconds for claim phase (reduced from 60)
        
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
        
        // Increment round number - Fix: change to use value instead of callback
        setRoundNumber(roundNumber + 1);
        
        // Reset score for new round
        setScore(0);
      }
      return;
    }

    const timer = setTimeout(() => {
      setPhaseTime(prevTime => prevTime - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phaseTime, gamePhase, gameState.hasClaimedPlot, gameState.currentPosition, score, resetPlotClaim, setRoundNumber, setScore, setIsVictoryModalOpen, roundNumber]);

  return { gamePhase, phaseTime };
}
