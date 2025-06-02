
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { waxService } from '@/services/waxService';

export const NetworkHealth: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkHealth = async () => {
      if (isChecking) return;
      
      setIsChecking(true);
      try {
        const healthy = await waxService.checkNetworkHealth();
        setIsHealthy(healthy);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkHealth();

    // Check every 30 seconds
    interval = setInterval(checkHealth, 30000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isChecking]);

  // Don't show anything if network is healthy
  if (isHealthy === true) return null;

  // Show warning if network is unhealthy
  if (isHealthy === false) {
    return (
      <Alert className="fixed top-16 left-4 right-4 z-40 bg-yellow-900 border-yellow-700 text-yellow-100">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          WAX network connection issues detected. Transactions may fail or be delayed.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  return (
    <Alert className="fixed top-16 left-4 right-4 z-40 bg-blue-900 border-blue-700 text-blue-100">
      <Wifi className="h-4 w-4 animate-pulse" />
      <AlertDescription>
        Checking WAX network status...
      </AlertDescription>
    </Alert>
  );
};
