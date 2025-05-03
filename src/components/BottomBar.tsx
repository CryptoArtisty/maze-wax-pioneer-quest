
import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useWaxWallet } from '@/contexts/WaxWalletContext';

const BottomBar: React.FC = () => {
  const { gameState, payMovementFee } = useWaxWallet();
  
  const handleHint = async () => {
    const HINT_COST = 500;
    
    // Check if user is authenticated
    if (!gameState.isAuthenticated) {
      toast("Please connect your wallet first");
      return;
    }
    
    // Check if user has enough gold balance
    if (gameState.goldBalance < HINT_COST) {
      toast.error(`Not enough gold! Need ${HINT_COST} gold for a hint.`);
      return;
    }
    
    // Pay for hint - send to treasury (null owner)
    const success = await payMovementFee(HINT_COST, null);
    if (!success) {
      toast.error("Failed to process hint payment.");
      return;
    }
    
    // Create and dispatch a custom event to trigger the hint functionality
    console.log("BottomBar - Dispatching show-maze-hint event");
    const hintEvent = new CustomEvent('show-maze-hint');
    window.dispatchEvent(hintEvent);
    
    toast.success(`Used ${HINT_COST} gold for hint`);
  };
  
  const handleShare = async () => {
    const shareData = {
      title: 'Pyrameme Quest Saga',
      text: `I'm playing Pyrameme Quest Saga! Check it out!`,
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
        toast('Copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };
  
  return (
    <div className="mt-8 mb-10 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-2 px-4">
        <Button 
          onClick={handleHint}
          className="w-full py-6 bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
        >
          Hint (500 Gold)
        </Button>
        
        <Button 
          onClick={handleShare}
          className="w-full py-6 bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
        >
          𓀣 Share Your Victory
        </Button>
        
        <div className="w-full p-4 mt-2 border-t-2 border-gold text-center text-gold">
          Advertisement Banner
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
