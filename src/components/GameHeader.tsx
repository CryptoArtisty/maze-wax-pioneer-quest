
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import LoginModal from './LoginModal';
import { Menu } from 'lucide-react';

interface GameHeaderProps {
  onOpenDrawer: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ onOpenDrawer }) => {
  const { gameState } = useWaxWallet();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <header className="w-full bg-[rgba(0,0,0,0.7)] border-b-2 border-gold py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <Button 
          onClick={onOpenDrawer} 
          size="sm"
          className="bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
        >
          <Menu className="mr-1 h-4 w-4" /> Menu
        </Button>

        <div className="flex items-center gap-2">
          {!gameState.isAuthenticated ? (
            <>
              <Button 
                onClick={() => setIsLoginModalOpen(true)}
                size="sm"
                className="bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
              >
                Connect Wallet
              </Button>
              
              <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
              />
            </>
          ) : (
            <div className="flex items-center gap-2 bg-[rgba(0,0,0,0.7)] px-3 py-1 rounded-md border border-gold">
              <div className="h-6 w-6 rounded-full bg-gold flex items-center justify-center">
                <span className="text-black font-bold text-xs">
                  {gameState.userId?.substring(0, 1).toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-medium hidden md:block text-gold">
                {gameState.userId}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
