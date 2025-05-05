
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Confetti } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, onClose, score }) => {
  // Create confetti effect
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti effect when modal opens
      const event = new CustomEvent('trigger-confetti');
      window.dispatchEvent(event);
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-dark border-2 border-gold text-gold">
        <DialogHeader className="flex flex-col items-center">
          <Confetti className="h-12 w-12 text-gold mb-2 animate-bounce" />
          <DialogTitle className="text-xl font-bold text-center">
            Congratulations! You've found the exit
          </DialogTitle>
          <div className="mt-4 text-center">
            Your score: {score}
          </div>
        </DialogHeader>
        
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
  );
};

export default VictoryModal;
