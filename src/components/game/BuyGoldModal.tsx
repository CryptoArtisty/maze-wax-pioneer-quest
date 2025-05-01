
import React from 'react';
import { Button } from "@/components/ui/button";
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { toast } from 'sonner';
import { Coins } from 'lucide-react';

interface BuyGoldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuyGoldModal: React.FC<BuyGoldModalProps> = ({ isOpen, onClose }) => {
  const [buyAmount, setBuyAmount] = React.useState(1);
  const { buyGold } = useWaxWallet();

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
        <h2 className="text-xl font-bold mb-4">Buy Gold</h2>
        <p className="mb-4">Exchange your WAXP for gold coins at a rate of 1 WAXP = 1000 gold</p>
        
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount of WAXP to spend:
            </label>
            <input 
              type="number" 
              min="0.1"
              step="0.1"
              value={buyAmount}
              onChange={(e) => setBuyAmount(parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-transparent border border-gold rounded text-gold"
            />
          </div>
          
          <div className="text-center">
            <p>You will receive: {buyAmount * 1000} gold</p>
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
            className="bg-[#4a3728] hover:bg-[#6a5748] border-gold text-gold"
          >
            <Coins size={18} className="mr-2 text-yellow-400" />
            Buy Gold
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyGoldModal;
