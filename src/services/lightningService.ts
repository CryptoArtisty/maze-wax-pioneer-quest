import { requestProvider } from 'webln';
import { LightningUser, LightningBalance } from '@/types/lightningTypes';

class LightningService {
  private webln: any = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.webln = await requestProvider();
      this.initialized = true;
      console.log('WebLN provider initialized');
    } catch (error) {
      console.error('Failed to initialize WebLN provider:', error);
      throw new Error('WebLN not available. Please install a Lightning wallet browser extension like Alby or Joule.');
    }
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'webln' in window;
  }

  async authenticate(): Promise<LightningUser | null> {
    await this.initialize();
    
    if (!this.webln) {
      throw new Error('WebLN provider not available');
    }

    try {
      // Enable the WebLN provider
      await this.webln.enable();
      
      // Get node info
      const info = await this.webln.getInfo();
      
      return {
        node: {
          alias: info.node?.alias || 'Lightning User',
          pubkey: info.node?.pubkey || 'unknown',
          color: info.node?.color
        },
        balance: info.balance || 0
      };
    } catch (error) {
      console.error('Lightning authentication failed:', error);
      return null;
    }
  }

  async getBalance(): Promise<LightningBalance> {
    if (!this.webln) {
      throw new Error('WebLN not initialized');
    }

    try {
      const info = await this.webln.getInfo();
      return { satoshis: info.balance || 0 };
    } catch (error) {
      console.error('Failed to get balance:', error);
      // Return mock balance for demo
      return { satoshis: 100000 }; // 100k satoshis = ~$30 at current rates
    }
  }

  async payInvoice(invoice: string): Promise<{ preimage: string }> {
    if (!this.webln) {
      throw new Error('WebLN not initialized');
    }

    try {
      const response = await this.webln.sendPayment(invoice);
      return { preimage: response.preimage };
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }

  async makeInvoice(amount: number, description: string): Promise<{ paymentRequest: string }> {
    if (!this.webln) {
      throw new Error('WebLN not initialized');
    }

    try {
      const response = await this.webln.makeInvoice({
        amount: amount,
        defaultMemo: description
      });
      return { paymentRequest: response.paymentRequest };
    } catch (error) {
      console.error('Invoice creation failed:', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<{ signature: string }> {
    if (!this.webln) {
      throw new Error('WebLN not initialized');
    }

    try {
      const response = await this.webln.signMessage(message);
      return { signature: response.signature };
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  }

  // Simulate spending satoshis for game actions
  async spendSatoshis(amount: number, description: string): Promise<boolean> {
    try {
      console.log(`Spending ${amount} satoshis for: ${description}`);
      
      // In a real implementation, you would create an invoice and process payment
      // For demo purposes, we'll simulate success
      
      // Create a mock invoice (in real app, this would be from your backend)
      const mockInvoice = `lnbc${amount}n1p... (${description})`;
      
      // For demo, just log the action
      console.log(`Mock payment of ${amount} sats for ${description}`);
      return true;
    } catch (error) {
      console.error('Failed to spend satoshis:', error);
      return false;
    }
  }

  formatSatoshis(satoshis: number): string {
    if (satoshis >= 100000000) {
      return `${(satoshis / 100000000).toFixed(2)} BTC`;
    } else if (satoshis >= 1000) {
      return `${(satoshis / 1000).toFixed(0)}k sats`;
    } else {
      return `${satoshis} sats`;
    }
  }

  // Convert satoshis to bitcoin
  satsToBtc(satoshis: number): number {
    return satoshis / 100000000;
  }

  // Convert bitcoin to satoshis
  btcToSats(btc: number): number {
    return Math.floor(btc * 100000000);
  }
}

export const lightningService = new LightningService();