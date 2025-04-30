
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WalletType } from '@/types/waxTypes';
import { useWaxWallet } from '@/contexts/WaxWalletContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useWaxWallet();
  const navigate = useNavigate();

  const handleLoginWithWallet = async (walletType: WalletType) => {
    const success = await login(walletType);
    if (success) {
      onClose();
      navigate('/game');
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
            className="bg-[#0076ba] hover:bg-[#0076ba]/80 text-white py-6 rounded-lg flex items-center justify-center gap-3"
          >
            <img 
              src="https://www.mycloudwallet.com/images/wax-logo.svg" 
              alt="WAX Cloud Wallet" 
              className="w-6 h-6" 
            />
            <span className="text-lg font-medium">WAX Cloud Wallet</span>
          </Button>
          
          <Button 
            onClick={() => handleLoginWithWallet(WalletType.ANCHOR)}
            className="bg-[#2B3139] hover:bg-[#2B3139]/80 text-white py-6 rounded-lg flex items-center justify-center gap-3"
          >
            <img 
              src="https://www.gpslot.app/assets/images/anchor-wallet.svg" 
              alt="Anchor Wallet" 
              className="w-6 h-6" 
            />
            <span className="text-lg font-medium">Anchor Wallet</span>
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
