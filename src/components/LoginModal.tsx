
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WalletType } from '@/types/waxTypes';
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { Loader2, Wallet } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useWaxWallet();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<WalletType | null>(null);

  const handleLoginWithWallet = async (walletType: WalletType) => {
    try {
      setIsLoading(walletType);
      const success = await login(walletType);
      if (success) {
        onClose();
        navigate('/game');
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>By connecting a wallet, you agree to our Terms of Service</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
