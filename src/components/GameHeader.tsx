
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
    <header className="w-full bg-[rgba(0,0,0,0.7)] border-b-2 border-gold py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Button 
          onClick={onOpenDrawer} 
          className="bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
        >
          <Menu className="mr-2" /> Menu
        </Button>

        <div className="flex items-center gap-4">
          {!gameState.isAuthenticated ? (
            <>
              <Button 
                onClick={() => setIsLoginModalOpen(true)}
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
            <div className="flex items-center gap-2 bg-[rgba(0,0,0,0.7)] px-4 py-2 rounded-md border border-gold">
              <div className="h-8 w-8 rounded-full bg-gold flex items-center justify-center">
                <span className="text-black font-bold">
                  {gameState.userId?.substring(0, 1).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium hidden md:block text-gold">
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
