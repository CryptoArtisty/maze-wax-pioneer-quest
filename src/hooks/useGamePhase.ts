
import { useState, useEffect } from 'react';
import { GamePhase } from '@/types/gameTypes';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { toast } from 'sonner';
import { globalTimer } from '@/services/globalTimerService';

export function useGamePhase(
  score: number,
  roundNumber: number, 
  setRoundNumber: (num: number) => void,
  setScore: (score: number) => void,
  setIsVictoryModalOpen: (isOpen: boolean) => void
) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('claim');
  const [phaseTime, setPhaseTime] = useState(10);
  const [playerFoundExit, setPlayerFoundExit] = useState(false);
  const [lastRoundNumber, setLastRoundNumber] = useState(1);
  const [hasShownJoinAlert, setHasShownJoinAlert] = useState(false);
  const { gameState, resetPlotClaim } = useWaxWallet();

  // Listen for exit found event
  useEffect(() => {
    const handleExitFound = () => {
      setPlayerFoundExit(true);
    };

    window.addEventListener('player-found-exit', handleExitFound);
    return () => window.removeEventListener('player-found-exit', handleExitFound);
  }, []);

  // Show toast message for plot claim status when phase changes to play
  useEffect(() => {
    if (gamePhase === 'play') {
      if (gameState.hasClaimedPlot) {
        toast.success("Plot claimed! You can now play this round.");
      } else {
        toast.warning("No plot claimed! You cannot participate in this round.");
      }
    }
  }, [gamePhase, gameState.hasClaimedPlot]);

  // Global timer sync - continuously sync with global game state
  useEffect(() => {
    const syncWithGlobalTimer = () => {
      const globalState = globalTimer.getCurrentGameState();
      
      setGamePhase(globalState.phase);
      setPhaseTime(globalState.timeRemaining);
      
      // Handle round transitions
      if (globalState.roundNumber !== lastRoundNumber) {
        // New round started
        setLastRoundNumber(globalState.roundNumber);
        setRoundNumber(globalState.roundNumber);
        
        // Only reset game state if we were playing the previous round
        if (gameState.currentPosition) {
          // Save high score
          const currentHighScore = parseInt(localStorage.getItem('pyrameme-high-score') || '0');
          if (score > currentHighScore) {
            localStorage.setItem('pyrameme-high-score', score.toString());
          }
          
          // Show appropriate modal based on whether player found exit
          if (playerFoundExit) {
            setIsVictoryModalOpen(true);
          } else if (gamePhase === 'claim') {
            // Round just ended, show transition message
            toast.info("Round ended! New round starting - claim your plot!");
          }
        }
        
        // Reset for new round
        resetPlotClaim();
        setScore(0);
        setPlayerFoundExit(false);
        setHasShownJoinAlert(false);
      }
      
      // Show join alerts for new players joining mid-game
      if (!globalState.canJoinNow && !hasShownJoinAlert && !gameState.currentPosition) {
        const timeUntilClaim = globalTimer.getTimeUntilNextClaimPhase();
        const minutes = Math.floor(timeUntilClaim / 60);
        const seconds = timeUntilClaim % 60;
        
        toast.info(
          `Round ${globalState.roundNumber} in progress. Next claim phase in ${minutes}:${seconds.toString().padStart(2, '0')}`,
          { duration: 5000 }
        );
        setHasShownJoinAlert(true);
      }
    };

    // Initial sync
    syncWithGlobalTimer();
    
    // Set up interval to sync every second
    const interval = setInterval(syncWithGlobalTimer, 1000);
    
    return () => clearInterval(interval);
  }, [lastRoundNumber, gameState.currentPosition, gameState.hasClaimedPlot, score, playerFoundExit, hasShownJoinAlert, resetPlotClaim, setRoundNumber, setScore, setIsVictoryModalOpen, gamePhase]);

  return { gamePhase, phaseTime };
}
