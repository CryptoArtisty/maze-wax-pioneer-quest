
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import LoginModal from './LoginModal';

const GameHeader: React.FC = () => {
  const { gameState } = useWaxWallet();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <header className="w-full bg-card/90 backdrop-blur-md border-b border-maze-wall py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-maze-highlight to-purple-400 bg-clip-text text-transparent">
            Pyrameme Quest Saga
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {!gameState.isAuthenticated ? (
            <>
              <Button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-maze-highlight text-black hover:bg-maze-highlight/80"
              >
                Connect Wallet
              </Button>
              
              <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-maze-highlight flex items-center justify-center">
                <span className="text-black font-bold">
                  {gameState.userId?.substring(0, 1).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium hidden md:block">
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
