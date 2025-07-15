
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLightning } from '@/contexts/LightningContext';
import { toast } from 'sonner';
import { Coins } from 'lucide-react';

interface BuyGoldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuyGoldModal: React.FC<BuyGoldModalProps> = ({ isOpen, onClose }) => {
  const [buyAmount, setBuyAmount] = React.useState(100);
  const { buyGold } = useLightning();

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
        <h2 className="text-xl font-bold mb-4">⚡ Buy Gold with Satoshis</h2>
        <p className="mb-4">Exchange your Satoshis for gold coins at a rate of 1 Satoshi = 1 gold</p>
        
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount of Satoshis to spend:
            </label>
            <input 
              type="number" 
              min="1"
              step="1"
              value={buyAmount}
              onChange={(e) => setBuyAmount(parseInt(e.target.value) || 100)}
              className="w-full p-2 bg-transparent border border-orange-400 rounded text-orange-400"
            />
          </div>
          
          <div className="text-center">
            <p className="text-orange-400">You will receive: {buyAmount} gold</p>
            <p className="text-xs text-muted-foreground mt-1">
              {buyAmount} sats ≈ ${(buyAmount * 0.0003).toFixed(4)} USD
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
            ⚡ Pay {buyAmount} Satoshis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyGoldModal;
