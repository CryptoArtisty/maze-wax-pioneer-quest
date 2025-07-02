
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WalletType } from '@/types/waxTypes';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { Loader2, Wallet, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useWaxWallet();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<WalletType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoginWithWallet = async (walletType: WalletType) => {
    try {
      setIsLoading(walletType);
      setError(null);
      
      console.log(`Attempting login with ${walletType} wallet...`);
      
      const success = await login(walletType);
      if (success) {
        console.log(`Successfully logged in with ${walletType} wallet`);
        onClose();
        navigate('/game');
      } else {
        console.warn(`Login failed for ${walletType} wallet`);
        setError(`${walletType} wallet connection failed. Please try again or use demo mode.`);
      }
    } catch (error) {
      console.error(`Login error for ${walletType}:`, error);
      setError(`Unexpected error with ${walletType} wallet. Please try again.`);
    } finally {
      setIsLoading(null);
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing during loading
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-card border-maze-wall max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-maze-highlight">Connect Wallet</DialogTitle>
          <DialogDescription className="text-foreground/80">
            Choose a wallet to connect to Pyrameme Quest Saga
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-4">
          <Button 
            onClick={() => handleLoginWithWallet(WalletType.CLOUD)}
            disabled={isLoading !== null}
            className="bg-[#0076ba] hover:bg-[#0076ba]/80 text-white py-6 rounded-lg flex items-center justify-center gap-3"
          >
            {isLoading === WalletType.CLOUD ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Wallet className="w-6 h-6" />
            )}
            <span className="text-lg font-medium">
              {isLoading === WalletType.CLOUD ? 'Connecting...' : 'WAX Cloud Wallet'}
            </span>
          </Button>
          
          <Button 
            onClick={() => handleLoginWithWallet(WalletType.ANCHOR)}
            disabled={isLoading !== null}
            className="bg-[#2B3139] hover:bg-[#2B3139]/80 text-white py-6 rounded-lg flex items-center justify-center gap-3"
          >
            {isLoading === WalletType.ANCHOR ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Wallet className="w-6 h-6" />
            )}
            <span className="text-lg font-medium">
              {isLoading === WalletType.ANCHOR ? 'Connecting...' : 'Anchor Wallet'}
            </span>
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>By connecting a wallet, you agree to our Terms of Service</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
