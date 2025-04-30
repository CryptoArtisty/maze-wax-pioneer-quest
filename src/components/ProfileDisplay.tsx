
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { WalletType } from '@/types/waxTypes';

const ProfileDisplay: React.FC = () => {
  const { gameState, logout } = useWaxWallet();
  
  if (!gameState.isAuthenticated) {
    return null;
  }
  
  return (
    <Card className="bg-card border-maze-wall w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-maze-highlight flex items-center justify-center">
              <span className="text-black font-bold text-xl">
                {gameState.userId?.substring(0, 1).toUpperCase()}
              </span>
            </div>
            
            <div>
              <h3 className="text-xl font-medium">{gameState.userId}</h3>
              <p className="text-sm text-muted-foreground">
                Connected with {gameState.walletType === WalletType.CLOUD ? 'WAX Cloud Wallet' : 'Anchor Wallet'}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => logout()}
            className="border-maze-highlight text-maze-highlight hover:bg-maze-highlight hover:text-black"
          >
            Logout
          </Button>
        </div>
        
        {gameState.balance && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">WAXP Balance</p>
              <p className="text-xl font-semibold">{gameState.balance.waxp}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">PGL Balance</p>
              <p className="text-xl font-semibold">{gameState.balance.pgl}</p>
            </div>
          </div>
        )}
        
        {gameState.currentPosition ? (
          <div className="mt-4 bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Your Position</p>
            <p className="text-md">Cell [{gameState.currentPosition.x}, {gameState.currentPosition.y}]</p>
          </div>
        ) : (
          <div className="mt-4 bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">You haven't claimed a cell yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileDisplay;
