
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

  private networks: Record<string, NetworkConfig> = {
    testnet: {
      chainId: 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
      nodeUrl: 'https://testnet.waxsweden.org',
      explorerUrl: 'https://wax-test.bloks.io',
      contractAccount: 'pyramemegame', // Replace with actual testnet contract
      isTestnet: true
    },
    mainnet: {
      chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
      nodeUrl: 'https://wax.greymass.com',
      explorerUrl: 'https://wax.bloks.io',
      contractAccount: 'pyramemegame', // Replace with actual mainnet contract
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
    console.log(`Switched to ${network}:`, this.getCurrentNetwork());
  }

  getExplorerUrl(transactionId: string): string {
    return `${this.getCurrentNetwork().explorerUrl}/transaction/${transactionId}`;
  }

  isTestnet(): boolean {
    return this.getCurrentNetwork().isTestnet;
  }

  async checkNetworkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.getCurrentNetwork().nodeUrl}/v1/chain/get_info`);
      const info = await response.json();
      return !!info.chain_id;
    } catch (error) {
      console.error("Network health check failed:", error);
      return false;
    }
  }
}
