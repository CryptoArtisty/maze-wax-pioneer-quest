
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LightningLoginModal } from '@/components/LightningLoginModal';
import { useLightning } from '@/contexts/LightningContext';

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const { gameState } = useLightning();
  const navigate = useNavigate();

  // Redirect to game if already authenticated
  useEffect(() => {
    if (gameState.isAuthenticated) {
      navigate('/game');
    }
  }, [gameState.isAuthenticated, navigate]);

  const handleLightningLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleDemoMode = () => {
    // For Lightning version, we'll redirect to login instead of demo
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-dark to-bg-gradient1 text-gold">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-6">⚡ Pyramid Quest Lightning ⚡</h1>
        <p className="text-xl mb-8">A Bitcoin Lightning maze game where players use Satoshis to claim plots and collect treasures</p>
        
        <div className="space-y-4">
          <button 
            onClick={handleLightningLogin}
            className="bg-orange-500 border-2 border-orange-400 text-white hover:bg-orange-600 py-3 px-6 rounded-lg text-lg w-full flex items-center justify-center gap-2"
          >
            ⚡ Connect Lightning Wallet
          </button>
          
          <div className="text-sm text-gold/70 space-y-1">
            <p>• Use Satoshis (the smallest Bitcoin unit)</p>
            <p>• Claim plots and navigate mazes</p>
            <p>• Collect treasures with instant payments</p>
            <p>• Powered by Bitcoin Lightning Network</p>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gold/70">
          <p>⚡ Instant Bitcoin payments</p>
          <p>₿ Earn real Satoshis</p>
        </div>
      </div>
      
      <LightningLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
