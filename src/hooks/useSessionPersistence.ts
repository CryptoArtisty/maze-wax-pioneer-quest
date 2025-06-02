
import { useEffect } from 'react';
import { waxService } from '@/services/waxService';

export function useSessionPersistence() {
  useEffect(() => {
    // Restore network setting from localStorage on app start
    const savedNetwork = localStorage.getItem('pyrameme-network');
    if (savedNetwork === 'testnet' || savedNetwork === 'mainnet') {
      waxService.setNetwork(savedNetwork);
    }

    // Set up cleanup interval for old transactions
    const cleanupInterval = setInterval(() => {
      // This will be called by the transaction service internally
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
