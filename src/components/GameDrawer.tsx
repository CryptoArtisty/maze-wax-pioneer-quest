
import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWaxWallet } from '@/contexts/WaxWalletContext';
import { LogOut, User, Wallet, History, Settings, Network } from 'lucide-react';
import ProfileDisplay from './ProfileDisplay';
import TransactionHistory from './TransactionHistory';
import { waxService } from '@/services/waxService';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';

interface GameDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameDrawer: React.FC<GameDrawerProps> = ({ isOpen, onClose }) => {
  const { gameState, logout } = useWaxWallet();
  const [currentTab, setCurrentTab] = React.useState<'profile' | 'transactions' | 'settings'>('profile');
  const { saveNetworkSetting } = useSessionPersistence();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const switchNetwork = (network: 'testnet' | 'mainnet') => {
    waxService.setNetwork(network);
    saveNetworkSetting(network);
  };

  const currentNetwork = waxService.getCurrentNetwork();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Player Dashboard
          </SheetTitle>
          <SheetDescription>
            Manage your account and view game statistics
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={currentTab === 'profile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTab('profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant={currentTab === 'transactions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTab('transactions')}
            >
              <History className="h-4 w-4 mr-2" />
              Transactions
            </Button>
            <Button
              variant={currentTab === 'settings' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTab('settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          <Separator className="mb-4" />

          {/* Tab Content */}
          {currentTab === 'profile' && <ProfileDisplay />}
          
          {currentTab === 'transactions' && <TransactionHistory />}
          
          {currentTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Network Settings
                </h3>
                <div className="flex gap-2 mb-2">
                  <Button
                    variant={currentNetwork?.isTestnet ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => switchNetwork('testnet')}
                  >
                    WAX Testnet
                  </Button>
                  <Button
                    variant={!currentNetwork?.isTestnet ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => switchNetwork('mainnet')}
                  >
                    WAX Mainnet
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Current: {currentNetwork?.isTestnet ? 'Testnet' : 'Mainnet'}</p>
                  <p>Contract: {currentNetwork?.contractAccount}</p>
                  <p>Chain ID: {currentNetwork?.chainId.substring(0, 16)}...</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Game Information</h3>
                <p className="text-sm text-muted-foreground">
                  Pyrameme Quest Saga v1.0<br/>
                  Built on WAX blockchain<br/>
                  Smart contract: {currentNetwork?.contractAccount}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Developer Info</h3>
                <p className="text-sm text-muted-foreground">
                  Developer wallet: {waxService.getDeveloperWalletAddress()}<br/>
                  Network health: Connected
                </p>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Account Actions */}
          {gameState.isAuthenticated && (
            <div className="space-y-2">
              <Button 
                onClick={handleLogout}
                variant="destructive" 
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GameDrawer;
