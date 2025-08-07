
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LightningLoginModal } from '@/components/LightningLoginModal';
import LoginModal from '@/components/LoginModal';
import { useLightning } from '@/contexts/LightningContext';
import { useWaxWallet } from '@/contexts/WaxWalletContext';

const Index = () => {
  const [isLightningLoginModalOpen, setIsLightningLoginModalOpen] = useState(false);
  const [isDemoLoginModalOpen, setIsDemoLoginModalOpen] = useState(false);
  const [gameMode, setGameMode] = useState<'lightning' | 'demo' | null>(null);
  
  const { gameState: lightningGameState } = useLightning();
  const { gameState: demoGameState, loginDemo } = useWaxWallet();
  const navigate = useNavigate();

  // Redirect to game if already authenticated in either mode
  useEffect(() => {
    if (lightningGameState.isAuthenticated || demoGameState.isAuthenticated) {
      navigate('/game');
    }
  }, [lightningGameState.isAuthenticated, demoGameState.isAuthenticated, navigate]);

  const handleLightningLogin = () => {
    setGameMode('lightning');
    setIsLightningLoginModalOpen(true);
  };

  const handleDemoMode = () => {
    setGameMode('demo');
    setIsDemoLoginModalOpen(true);
  };

  const handleQuickDemo = () => {
    loginDemo();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-dark to-bg-gradient1 text-gold">
      <div className="text-center p-8 max-w-lg w-full">
        <h1 className="text-4xl font-bold mb-6">🏺 Pyramid Quest 🏺</h1>
        <p className="text-xl mb-8">A maze game where players claim plots and collect treasures</p>
        
        <div className="space-y-4">
          <button 
            onClick={handleLightningLogin}
            className="bg-orange-500 border-2 border-orange-400 text-white hover:bg-orange-600 py-3 px-6 rounded-lg text-lg w-full flex items-center justify-center gap-2"
          >
            ⚡ Play with Bitcoin Lightning
          </button>
          
          <div className="text-sm text-gold/70 space-y-1 mb-4">
            <p>• Use real Satoshis (smallest Bitcoin unit)</p>
            <p>• Instant Bitcoin payments via Lightning Network</p>
            <p>• Earn real Bitcoin rewards</p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gold/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-bg-dark px-4 text-gold/70">or</span>
            </div>
          </div>
          
          <button 
            onClick={handleQuickDemo}
            className="bg-green-600 border-2 border-green-500 text-white hover:bg-green-700 py-3 px-6 rounded-lg text-lg w-full flex items-center justify-center gap-2"
          >
            🚀 Quick Demo (No Wallet)
          </button>
          
          <div className="text-sm text-gold/70 space-y-1 mb-4">
            <p>• Instant play - no setup required</p>
            <p>• Practice with virtual currency</p>
            <p>• Learn the game mechanics</p>
          </div>

          <button 
            onClick={handleDemoMode}
            className="bg-purple-600 border-2 border-purple-500 text-white hover:bg-purple-700 py-3 px-6 rounded-lg text-lg w-full flex items-center justify-center gap-2"
          >
            🎮 Demo with Wallet
          </button>
          
          <div className="text-sm text-gold/70 space-y-1">
            <p>• Connect wallet for demo mode</p>
            <p>• Test wallet integration</p>
            <p>• Prepare for real gameplay</p>
          </div>
        </div>
      </div>
      
      <LightningLoginModal 
        isOpen={isLightningLoginModalOpen} 
        onClose={() => setIsLightningLoginModalOpen(false)} 
      />
      
      <LoginModal 
        isOpen={isDemoLoginModalOpen} 
        onClose={() => setIsDemoLoginModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
