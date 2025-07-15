import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLightning } from '@/contexts/LightningContext';
import { toast } from 'sonner';
import { Zap, Wallet } from 'lucide-react';

interface LightningLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LightningLoginModal({ isOpen, onClose }: LightningLoginModalProps) {
  const { login } = useLightning();

  const handleLogin = async () => {
    try {
      const success = await login();
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Lightning login failed:', error);
      toast.error('Failed to connect Lightning wallet');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
            <Zap className="text-orange-500" size={24} />
            Pyramid Quest Lightning
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Connect your Lightning wallet to start playing and earning Bitcoin!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleLogin}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              <Wallet className="mr-2" size={18} />
              Connect Lightning Wallet
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground space-y-2">
            <p>
              Requires a WebLN-compatible wallet like:
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="bg-muted px-2 py-1 rounded">Alby</span>
              <span className="bg-muted px-2 py-1 rounded">Joule</span>
              <span className="bg-muted px-2 py-1 rounded">LNbits</span>
              <span className="bg-muted px-2 py-1 rounded">Zeus</span>
            </div>
            <p>
              Use Satoshis (Bitcoin's smallest unit) for in-game purchases.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}