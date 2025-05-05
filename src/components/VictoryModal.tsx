
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Confetti from 'react-confetti';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  reachedExit: boolean;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, onClose, score, reachedExit }) => {
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {isOpen && reachedExit && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
        />
      )}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-bg-dark border-2 border-gold text-gold">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              {reachedExit ? "🏆 CONGRATULATIONS! 🏆" : "Round Complete"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-center">
            {reachedExit ? (
              <p className="text-lg">You escaped the maze and found treasure worth {score} gold!</p>
            ) : (
              <p className="text-lg">Your score: {score} gold</p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={onClose} 
              className="w-full bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VictoryModal;
