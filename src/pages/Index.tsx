
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '@/components/LoginModal';
import { useWaxWallet } from '@/contexts/WaxWalletContext';

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
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

  const handleShowWalletOptions = () => {
    setShowWalletOptions(true);
  };

  const handleSkipDemo = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-dark to-bg-gradient1 text-gold">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-6">𓋹 Pyrameme Quest 𓋹</h1>
        <p className="text-xl mb-8">A blockchain maze game where players claim Plots and navigate through puzzles to collect crypto treasures</p>
        
        {!showWalletOptions ? (
          <div className="space-y-4">
            <button 
              onClick={handleDemoLogin}
              className="bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80 py-3 px-6 rounded-lg text-lg w-full"
            >
              Try Demo (No Wallet Required)
            </button>
            
            <div className="space-y-2">
              <button 
                onClick={handleShowWalletOptions}
                className="bg-gray-700 border-2 border-gray-500 text-gray-300 hover:bg-gray-600 py-2 px-4 rounded-lg text-sm w-full"
              >
                Connect Wallet Instead
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-hieroglyphic-brown border-2 border-gold text-gold hover:bg-hieroglyphic-brown/80 py-3 px-6 rounded-lg text-lg w-full"
            >
              Connect Wallet
            </button>
            
            <div className="space-y-2">
              <button 
                onClick={handleDemoLogin}
                className="bg-gray-700 border-2 border-gray-500 text-gray-300 hover:bg-gray-600 py-2 px-4 rounded-lg text-sm w-full"
              >
                Try Demo Instead
              </button>
              
              <button 
                onClick={() => setShowWalletOptions(false)}
                className="text-gold/60 hover:text-gold text-sm underline"
              >
                ← Back to Demo
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-sm text-gold/70">
          <p>Experience the thrill of blockchain gaming</p>
          <p>Claim plots, solve puzzles, collect treasures!</p>
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
