
import React from 'react';
import { Button } from "@/components/ui/button";
import { Coins } from 'lucide-react';

interface GameTitleProps {
  onOpenBuyGoldModal: () => void;
}

const GameTitle: React.FC<GameTitleProps> = ({ onOpenBuyGoldModal }) => {
  return (
    <div className="flex justify-between items-center px-4">
      <h1 className="text-xl font-bold mt-3 mb-2">𓋹 Pyrameme Quest 𓋹</h1>
      <Button 
        onClick={onOpenBuyGoldModal}
        size="sm"
        className="mt-3 bg-[#4a3728] hover:bg-[#6a5748] border-gold text-gold h-8 px-2 flex-shrink-0"
      >
        <Coins size={16} className="text-yellow-400" />
      </Button>
    </div>
  );
};

export default GameTitle;
