
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { waxService } from '@/services/waxService';

export const NetworkHealth: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let consecutiveFailures = 0;

    const checkHealth = async () => {
      if (isChecking) return;
      
      setIsChecking(true);
      try {
        const healthy = await waxService.checkNetworkHealth();
        const currentNetwork = waxService.getCurrentNetwork();
        setNetworkInfo(`${currentNetwork.isTestnet ? 'Testnet' : 'Mainnet'}: ${currentNetwork.nodeUrl}`);
        
        if (healthy) {
          consecutiveFailures = 0;
          setIsHealthy(true);
          setShowAlert(false);
          console.log(`Network health check passed for ${networkInfo}`);
        } else {
          consecutiveFailures++;
          setIsHealthy(false);
          console.warn(`Network health check failed for ${networkInfo} (${consecutiveFailures} consecutive failures)`);
          
          // Only show alert after 2 consecutive failures to avoid flashing
          if (consecutiveFailures >= 2) {
            setShowAlert(true);
          }
        }
      } catch (error) {
        consecutiveFailures++;
        setIsHealthy(false);
        console.error(`Network health check error: ${error}`);
        if (consecutiveFailures >= 2) {
          setShowAlert(true);
        }
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkHealth();

    // Check every 60 seconds instead of 30 to reduce network load
    interval = setInterval(checkHealth, 60000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isChecking]);

  // Don't show anything if network is healthy or we haven't checked yet
  if (!showAlert || isHealthy === true) return null;

  // Show warning if network is consistently unhealthy
  if (isHealthy === false) {
    return (
      <Alert className="fixed top-16 left-4 right-4 z-40 bg-yellow-900/90 border-yellow-700 text-yellow-100 backdrop-blur-sm">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex justify-between items-center">
          <div>
            <div>WAX network connection issues. Game functions may be limited.</div>
            <div className="text-xs opacity-75 mt-1">{networkInfo}</div>
          </div>
          <button 
            onClick={() => setShowAlert(false)}
            className="text-yellow-300 hover:text-yellow-100 ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
