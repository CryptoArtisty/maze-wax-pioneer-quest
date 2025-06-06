
import { useEffect } from 'react';
import { waxService } from '@/services/waxService';
import { NetworkConfigService } from '@/services/networkConfigService';

export function useSessionPersistence() {
  useEffect(() => {
    // Initialize network configuration service
    const networkConfig = NetworkConfigService.getInstance();
    networkConfig.initialize();
    
    // Restore network setting and apply it to wax service
    const savedNetwork = localStorage.getItem('pyrameme-network');
    if (savedNetwork === 'testnet' || savedNetwork === 'mainnet') {
      waxService.setNetwork(savedNetwork);
    }

    // Set up cleanup interval for old transactions
    const cleanupInterval = setInterval(() => {
      const transactionHistory = waxService.getTransactionHistory();
      console.log(`Transaction cleanup check: ${transactionHistory.length} transactions`);
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Save network changes to localStorage
  const saveNetworkSetting = (network: 'testnet' | 'mainnet') => {
    localStorage.setItem('pyrameme-network', network);
  };

  return { saveNetworkSetting };
}
