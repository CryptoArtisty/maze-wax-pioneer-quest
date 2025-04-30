
import React, { useState } from 'react';
import GameHeader from '@/components/GameHeader';
import MazeGrid from '@/components/MazeGrid';
import ProfileDisplay from '@/components/ProfileDisplay';
import { Button } from '@/components/ui/button';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import LoginModal from '@/components/LoginModal';

const Game = () => {
  const { gameState } = useWaxWallet();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-maze-highlight to-purple-400 bg-clip-text text-transparent">
              Maze Explorer
            </span>
          </h2>
          
          {!gameState.isAuthenticated ? (
            <div className="flex flex-col items-center justify-center gap-6 py-12">
              <div className="max-w-md text-center">
                <h3 className="text-xl font-semibold mb-4">Connect Your Wallet to Play</h3>
                <p className="text-muted-foreground mb-6">
                  Login with WAX Cloud Wallet or Anchor Wallet to claim your starting position in the maze.
                </p>
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-maze-highlight text-black hover:bg-maze-highlight/80"
                  size="lg"
                >
                  Connect Wallet
                </Button>
                <LoginModal
                  isOpen={isLoginModalOpen}
                  onClose={() => setIsLoginModalOpen(false)}
                />
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="bg-card border border-maze-wall rounded-lg overflow-hidden">
                  <div className="bg-muted p-4 border-b border-maze-wall">
                    <h3 className="text-lg font-medium">Maze Grid</h3>
                    <p className="text-sm text-muted-foreground">
                      {!gameState.hasClaimedCell 
                        ? "Claim a cell to start your journey" 
                        : "You've claimed your starting position"}
                    </p>
                  </div>
                  <MazeGrid rows={10} cols={12} />
                </div>
              </div>
              
              <div>
                <ProfileDisplay />
                
                <div className="mt-8 bg-card border border-maze-wall rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Game Info</h3>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      Welcome to Pyrameme Quest Saga! Claim your starting position in the maze and
                      begin your journey to find the treasure.
                    </p>
                    <p>
                      Each player must claim one cell on the grid. This will be your starting point
                      towards solving the maze.
                    </p>
                    <p>
                      Watch for updates as we add more features to the game!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-maze-bg border-t border-maze-wall py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Pyrameme Quest Saga. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Game;
