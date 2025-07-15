
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TelegramLoginModal } from '@/components/TelegramLoginModal';
import { useTelegram } from '@/contexts/TelegramContext';

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const { gameState } = useTelegram();
  const navigate = useNavigate();

  // Redirect to game if already authenticated
  useEffect(() => {
    if (gameState.isAuthenticated) {
      navigate('/game');
    }
  }, [gameState.isAuthenticated, navigate]);

  const handleTelegramLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleDemoMode = () => {
    // For Telegram mini app, we'll redirect to login instead of demo
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-dark to-bg-gradient1 text-gold">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-6">⭐ Pyramid Quest ⭐</h1>
        <p className="text-xl mb-8">A Telegram mini app maze game where players use Stars to claim plots and collect treasures</p>
        
        <div className="space-y-4">
          <button 
            onClick={handleTelegramLogin}
            className="bg-blue-500 border-2 border-blue-400 text-white hover:bg-blue-600 py-3 px-6 rounded-lg text-lg w-full flex items-center justify-center gap-2"
          >
            ⭐ Connect with Telegram
          </button>
          
          <div className="text-sm text-gold/70 space-y-1">
            <p>• Use Telegram Stars to purchase gold</p>
            <p>• Claim plots and navigate mazes</p>
            <p>• Collect treasures and compete with friends</p>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gold/70">
          <p>🎮 Built for Telegram mini apps</p>
          <p>⭐ Powered by Telegram Stars</p>
        </div>
      </div>
      
      <TelegramLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
