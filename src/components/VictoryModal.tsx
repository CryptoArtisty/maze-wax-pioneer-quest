
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Trophy } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, onClose, score }) => {
  // Launch confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      launchConfetti();
    }
  }, [isOpen]);

  const launchConfetti = () => {
    // Create a canvas-confetti explosion
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Launch continuous confetti for 5 seconds
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Launch confetti from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-dark border-2 border-gold text-gold">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <Trophy size={48} className="text-gold animate-bounce" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Congratulations!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-4">
          <p className="text-xl mb-4">You found the exit and escaped the maze!</p>
          <p className="text-3xl font-bold mb-2">Your score: {score}</p>
          <p className="text-sm italic">Well done, adventurer!</p>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onClose} 
            className="w-full bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VictoryModal;
