
import React, { useState } from 'react';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface GameDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameDrawer: React.FC<GameDrawerProps> = ({ isOpen, onClose }) => {
  const { gameState, logout } = useWaxWallet();
  const [showManageFunds, setShowManageFunds] = useState(false);
  
  const handleTutorial = () => {
    toast.info("Tutorial:\n- Claim Phase: Click on a cell to claim it as your starting position.\n- Play Phase: Navigate the maze from your claimed cell. A parking fee is deducted when you step on others' cells.\n- Collect treasures and reach the exit to win.");
  };
  
  const handleManageFunds = () => {
    setShowManageFunds(!showManageFunds);
  };
  
  const handleLeaderboard = () => {
    toast.info("Leaderboard feature coming soon!");
  };
  
  const handleAchievements = () => {
    toast.info("Achievements feature coming soon!");
  };
  
  const handleWithdraw = () => {
    toast.info("Withdrawal initiated. Please wait 72 hours.");
  };
  
  return (
    <div 
      className={`fixed left-0 top-0 w-[300px] h-full bg-bg-dark transform transition-transform duration-300 z-50 p-5 border-r-2 border-gold overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <Button 
        onClick={onClose}
        className="w-full mb-4 bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
      >
        X Close
      </Button>
      
      <Button 
        onClick={handleTutorial}
        className="w-full mb-2 bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
      >
        Tutorial
      </Button>
      
      {gameState.isAuthenticated && (
        <>
          <Button 
            onClick={handleManageFunds}
            className="w-full mb-2 bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
          >
            Manage Funds
          </Button>
          
          <Button 
            onClick={() => logout()}
            className="w-full mb-2 bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
          >
            Disconnect Wallet
          </Button>
        </>
      )}
      
      <Button 
        onClick={handleLeaderboard}
        className="w-full mb-2 bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
      >
        Leaderboard
      </Button>
      
      <Button 
        onClick={handleAchievements}
        className="w-full mb-2 bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
      >
        Achievements
      </Button>
      
      {showManageFunds && (
        <div className="mt-4 p-4 border-2 border-gold rounded-lg">
          <h3 className="text-xl font-bold mb-3">Wax Escrow Management</h3>
          
          <p className="mb-2">Developer Wallet: <span className="text-sm">wax_developer_wallet</span></p>
          <p className="mb-4">Escrow Expires: <span>300 years</span></p>
          
          <div className="mb-4">
            <h4 className="font-bold mb-2">Profit and Loss</h4>
            <p>Total Profit: <span>0 WAXP</span></p>
            <p>Total Loss: <span>0 WAXP</span></p>
          </div>
          
          <div>
            <p className="mb-2">Withdraw funds to your Wax wallet:</p>
            <input 
              type="text" 
              placeholder="Your Wax Wallet"
              className="w-full p-2 mb-2 bg-muted text-foreground rounded border border-gold"
            />
            <Button 
              onClick={handleWithdraw}
              className="w-full bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80"
            >
              Withdraw
            </Button>
            <p className="mt-4 text-sm">Note: 72-hour waiting period applies.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDrawer;
