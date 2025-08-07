
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLightning } from '@/contexts/LightningContext';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { toast } from 'sonner';
import { Coins } from 'lucide-react';

interface BuyGoldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuyGoldModal: React.FC<BuyGoldModalProps> = ({ isOpen, onClose }) => {
  const lightningContext = useLightning();
  const waxContext = useWaxWallet();
  
  // Determine which context is active
  const isLightningMode = lightningContext.gameState.isAuthenticated;
  const buyGold = isLightningMode ? lightningContext.buyGold : waxContext.buyGold;
  
  const [buyAmount, setBuyAmount] = React.useState(isLightningMode ? 100 : 0.01);

  if (!isOpen) return null;

  const handleBuyGold = async () => {
    if (buyAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const success = await buyGold(buyAmount);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-dark border-2 border-gold rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          {isLightningMode ? '⚡ Buy Gold with Satoshis' : '💰 Buy Gold with WAXP'}
        </h2>
        <p className="mb-4">
          {isLightningMode 
            ? 'Exchange your Satoshis for gold coins at a rate of 1 Satoshi = 1 gold'
            : 'Exchange your WAXP for gold coins at a rate of 1 WAXP = 10,000 gold'
          }
        </p>
        
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              {isLightningMode ? 'Amount of Satoshis to spend:' : 'Amount of WAXP to spend:'}
            </label>
            <input 
              type="number" 
              min={isLightningMode ? "1" : "0.0001"}
              step={isLightningMode ? "1" : "0.0001"}
              value={buyAmount}
              onChange={(e) => setBuyAmount(isLightningMode ? parseInt(e.target.value) || 100 : parseFloat(e.target.value) || 0.01)}
              className="w-full p-2 bg-transparent border border-orange-400 rounded text-orange-400"
            />
          </div>
          
          <div className="text-center">
            <p className="text-orange-400">
              You will receive: {isLightningMode ? buyAmount : Math.floor(buyAmount * 10000)} gold
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isLightningMode 
                ? `${buyAmount} sats ≈ $${(buyAmount * 0.0003).toFixed(4)} USD`
                : `${buyAmount} WAXP ≈ $${(buyAmount * 0.05).toFixed(4)} USD`
              }
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button 
            onClick={onClose}
            variant="outline"
            className="border-gold text-gold hover:bg-gold/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBuyGold}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLightningMode ? `⚡ Pay ${buyAmount} Satoshis` : `💰 Pay ${buyAmount} WAXP`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyGoldModal;
