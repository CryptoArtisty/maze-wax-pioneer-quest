
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, onClose, score }) => {
  const handleWatchAd = () => {
    toast.success("You earned 50 WAXP from watching an ad!");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-dark border-2 border-gold text-gold">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            You completed the maze! Score: {score}
          </DialogTitle>
        </DialogHeader>
        
        <div className="my-4">
          <ul className="space-y-2">
            <li className="text-center">Watch an ad to earn 50 WAXP.</li>
          </ul>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleWatchAd} 
            className="w-full bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
          >
            Watch Ad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VictoryModal;
