export interface NetworkConfig {
  chainId: string;
  nodeUrl: string;
  explorerUrl: string;
  contractAccount: string;
  isTestnet: boolean;
}

export class NetworkConfigService {
  private static instance: NetworkConfigService;
  private currentNetwork: 'testnet' | 'mainnet' = 'testnet';
  private lastHealthCheck: number = 0;
  private healthCheckCache: boolean | null = null;
  private readonly HEALTH_CHECK_CACHE_DURATION = 60000; // 1 minute cache

  private networks: Record<string, NetworkConfig> = {
    testnet: {
      chainId: 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
      nodeUrl: 'https://waxtestnet.greymass.com',
      explorerUrl: 'https://testnet.waxblock.io',
      contractAccount: 'pyramemetest',
      isTestnet: true
    },
    mainnet: {
      chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
      nodeUrl: 'https://wax.greymass.com',
      explorerUrl: 'https://wax.bloks.io',
      contractAccount: 'pyramemegame',
      isTestnet: false
    }
  };

  static getInstance(): NetworkConfigService {
    if (!NetworkConfigService.instance) {
      NetworkConfigService.instance = new NetworkConfigService();
    }
    return NetworkConfigService.instance;
  }

  getCurrentNetwork(): NetworkConfig {
    return this.networks[this.currentNetwork];
  }

  setNetwork(network: 'testnet' | 'mainnet'): void {
    this.currentNetwork = network;
    this.healthCheckCache = null; // Reset cache when network changes
    console.log(`Switched to ${network}:`, this.getCurrentNetwork());
    
    // Save to localStorage for persistence
    localStorage.setItem('pyrameme-network', network);
  }

  getExplorerUrl(transactionId: string): string {
    return `${this.getCurrentNetwork().explorerUrl}/transaction/${transactionId}`;
  }

  isTestnet(): boolean {
    return this.getCurrentNetwork().isTestnet;
  }

  async checkNetworkHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if within cache duration
    if (this.healthCheckCache !== null && (now - this.lastHealthCheck) < this.HEALTH_CHECK_CACHE_DURATION) {
      return this.healthCheckCache;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout for testnet

      const response = await fetch(`${this.getCurrentNetwork().nodeUrl}/v1/chain/get_info`, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Network request failed: ${response.status}`);
      }

      const info = await response.json();
      const isHealthy = !!info.chain_id && info.chain_id === this.getCurrentNetwork().chainId;
      
      // Cache the result
      this.healthCheckCache = isHealthy;
      this.lastHealthCheck = now;
      
      if (!isHealthy) {
        console.warn('Network health check failed: Chain ID mismatch', {
          expected: this.getCurrentNetwork().chainId,
          received: info.chain_id
        });
      }
      
      return isHealthy;
    } catch (error) {
      // Only log errors that aren't AbortError to reduce console spam
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Network health check failed:", error);
      }
      
      // Cache failed result for shorter duration
      this.healthCheckCache = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  // Load network setting from localStorage on initialization
  initialize(): void {
    const savedNetwork = localStorage.getItem('pyrameme-network');
    if (savedNetwork === 'testnet' || savedNetwork === 'mainnet') {
      this.currentNetwork = savedNetwork;
      console.log(`Restored network setting: ${savedNetwork}`);
    }
  }
}
