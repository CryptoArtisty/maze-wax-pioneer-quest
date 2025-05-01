
import React from 'react';
import { Button } from "@/components/ui/button";
import { Coins } from 'lucide-react';

interface GameTitleProps {
  onOpenBuyGoldModal: () => void;
}

const GameTitle: React.FC<GameTitleProps> = ({ onOpenBuyGoldModal }) => {
  return (
    <div className="flex justify-between items-center px-4">
      <h1 className="text-2xl font-bold mt-5 mb-2">𓋹 Pyrameme Quest 𓋹</h1>
      <Button 
        onClick={onOpenBuyGoldModal}
        className="mt-5 bg-[#4a3728] hover:bg-[#6a5748] border-gold text-gold"
      >
        <Coins size={18} className="mr-2 text-yellow-400" />
        Buy Gold
      </Button>
    </div>
  );
};

export default GameTitle;
