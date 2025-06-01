
import { WalletType, WaxUser, WaxBalance } from "@/types/waxTypes";
import { toast } from "sonner";
import { CloudWalletService } from "./wallets/cloudWalletService";
import { AnchorWalletService } from "./wallets/anchorWalletService";
import { TransactionService } from "./transactionService";

class WaxWalletService {
  private cloudWallet: CloudWalletService;
  private anchorWallet: AnchorWalletService;
  private transactionService: TransactionService;
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
    }
    return user;
  }

  async loginWithAnchorWallet(): Promise<WaxUser | null> {
    const user = await this.anchorWallet.login();
    if (user) {
      this.currentWallet = this.anchorWallet;
    }
    return user;
  }

  async logout(): Promise<void> {
    try {
      toast.info("Logging out...");
      
      // Clear session data
      this.anchorWallet.clearSession();
      this.currentWallet = null;
      
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
}

export const waxService = new WaxWalletService();
