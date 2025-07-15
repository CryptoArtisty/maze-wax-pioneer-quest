import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTelegram } from '@/contexts/TelegramContext';
import { toast } from 'sonner';

interface TelegramLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TelegramLoginModal({ isOpen, onClose }: TelegramLoginModalProps) {
  const { login } = useTelegram();

  const handleLogin = async () => {
    try {
      const success = await login();
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Failed to authenticate with Telegram');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Welcome to Pyramid Quest
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Connect with Telegram to start playing and earning gold!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
            >
              🔗 Connect Telegram
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            <p>
              Uses Telegram Stars for in-game purchases.
              Game progress is saved to your Telegram account.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}