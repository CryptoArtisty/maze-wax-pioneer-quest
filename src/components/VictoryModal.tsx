
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import ReactConfetti from 'react-confetti';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, onClose, score }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Listen for player reaching exit to trigger confetti
  useEffect(() => {
    const handleExitFound = () => {
      setShowConfetti(true);
      // Auto-hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    };

    window.addEventListener('player-found-exit', handleExitFound);
    return () => window.removeEventListener('player-found-exit', handleExitFound);
  }, []);

  // Show confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [isOpen]);

  return (
    <>
      {/* Confetti that shows when player reaches exit, even before modal opens */}
      {showConfetti && (
        <ReactConfetti 
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
        />
      )}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-bg-dark border-2 border-gold text-gold">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              🎉 Congratulations! You've found the exit! 🎉
            </DialogTitle>
            <div className="text-xl mt-4 text-center">
              Your score: {score}
            </div>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              onClick={onClose} 
              className="w-full bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
            >
              Continue Playing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VictoryModal;
