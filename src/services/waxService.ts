
import { WalletType, WaxUser, WaxBalance } from "@/types/waxTypes";
import { toast } from "sonner";
import { CloudWalletService } from "./wallets/cloudWalletService";
import { AnchorWalletService } from "./wallets/anchorWalletService";
import { TransactionService } from "./transactionService";
import { NetworkConfigService } from "./networkConfigService";

class WaxWalletService {
  private cloudWallet: CloudWalletService;
  private anchorWallet: AnchorWalletService;
  private transactionService: TransactionService;
  private networkConfig = NetworkConfigService.getInstance();
  private currentWallet: CloudWalletService | AnchorWalletService | null = null;
  
  constructor() {
    this.cloudWallet = new CloudWalletService();
    this.anchorWallet = new AnchorWalletService();
    this.transactionService = new TransactionService();
  }

  async loginWithCloudWallet(): Promise<WaxUser | null> {
    const user = await this.cloudWallet.login();
    if (user) {
      this.currentWallet = this.cloudWallet;
      // Pass the API to transaction service for real transactions
      this.transactionService.setApi(this.cloudWallet.getApi());
    }
    return user;
  }

  async loginWithAnchorWallet(): Promise<WaxUser | null> {
    const user = await this.anchorWallet.login();
    if (user) {
      this.currentWallet = this.anchorWallet;
      // Pass the API to transaction service for real transactions
      this.transactionService.setApi(this.anchorWallet.getApi());
    }
    return user;
  }

  async logout(): Promise<void> {
    try {
      toast.info("Logging out...");
      
      // Clear session data
      this.anchorWallet.clearSession();
      this.currentWallet = null;
      
      // Clear transaction service API
      this.transactionService.setApi(null);
      
      // Clear local storage
      localStorage.removeItem('pyrameme-session');
      
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out");
    }
  }

  async getBalance(account: string): Promise<WaxBalance> {
    if (!this.currentWallet) {
      return {
        waxp: "0.0000",
        pgl: "0.0000"
      };
    }
    
    return this.currentWallet.getBalance(account);
  }

  async claimPlot(account: string, x: number, y: number): Promise<boolean> {
    return this.transactionService.claimPlot(account, x, y);
  }

  async buyGold(account: string, waxAmount: number): Promise<boolean> {
    return this.transactionService.buyGold(account, waxAmount);
  }
  
  async payPlotFee(account: string, fee: number, ownerAccount: string | null): Promise<boolean> {
    return this.transactionService.payPlotFee(account, fee, ownerAccount);
  }
  
  async collectTreasure(account: string, value: number): Promise<boolean> {
    return this.transactionService.collectTreasure(account, value);
  }
  
  async requestWithdrawal(account: string, amount: number): Promise<boolean> {
    return this.transactionService.requestWithdrawal(account, amount);
  }
  
  getDeveloperWalletAddress(): string {
    return this.transactionService.getDeveloperWalletAddress();
  }

  getTransactionHistory(): any[] {
    return this.transactionService.getTransactionHistory();
  }

  // Network management methods
  setNetwork(network: 'testnet' | 'mainnet'): void {
    this.networkConfig.setNetwork(network);
    
    // Update wallet configurations
    this.cloudWallet.setTestnet(network === 'testnet');
    this.anchorWallet.setTestnet(network === 'testnet');
    
    toast.info(`Switched to ${network}`);
  }

  getCurrentNetwork(): any {
    return this.networkConfig.getCurrentNetwork();
  }

  async checkNetworkHealth(): Promise<boolean> {
    return this.networkConfig.checkNetworkHealth();
  }
}

export const waxService = new WaxWalletService();
