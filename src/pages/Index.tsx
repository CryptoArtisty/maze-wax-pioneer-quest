
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '@/components/LoginModal';
import { useWaxWallet } from '@/contexts/WaxWalletContext';

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const { gameState, loginDemo } = useWaxWallet();
  const navigate = useNavigate();

  // Redirect to game if already authenticated
  useEffect(() => {
    if (gameState.isAuthenticated) {
      navigate('/game');
    }
  }, [gameState.isAuthenticated, navigate]);

  const handleDemoLogin = () => {
    loginDemo();
    navigate('/game');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-dark to-bg-gradient1 text-gold">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-6">𓋹 Pyrameme Quest 𓋹</h1>
        <p className="text-xl mb-8">Connect your WAX wallet to start your adventure</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80 py-3 px-6 rounded-lg text-lg w-full"
          >
            Connect Wallet
          </button>
          
          <button 
            onClick={handleDemoLogin}
            className="bg-gray-700 border-2 border-gray-500 text-gray-300 hover:bg-gray-600 py-3 px-6 rounded-lg text-lg w-full"
          >
            Try Demo (No Wallet)
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gold/70">
          <p>A blockchain maze game where players claim cells</p>
          <p>and navigate through puzzles to collect treasures</p>
        </div>
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
