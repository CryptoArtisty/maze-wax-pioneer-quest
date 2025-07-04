import { WalletType, WaxUser, WaxBalance } from "@/types/waxTypes";
import { toast } from "sonner";
import { SimpleCloudWallet } from "./wallets/simpleCloudWallet";
import { SimpleAnchorWallet } from "./wallets/simpleAnchorWallet";

class SimpleWalletService {
  private static instance: SimpleWalletService;
  private currentWallet: SimpleCloudWallet | SimpleAnchorWallet | null = null;
  private currentWalletType: WalletType | null = null;

  private constructor() {}

  static getInstance(): SimpleWalletService {
    if (!SimpleWalletService.instance) {
      SimpleWalletService.instance = new SimpleWalletService();
    }
    return SimpleWalletService.instance;
  }

  async loginCloud(): Promise<WaxUser | null> {
    try {
      const wallet = SimpleCloudWallet.getInstance();
      const user = await wallet.login();
      
      if (user) {
        this.currentWallet = wallet;
        this.currentWalletType = WalletType.CLOUD;
      }
      
      return user;
    } catch (error) {
      console.error("Cloud wallet login failed:", error);
      return null;
    }
  }

  async loginAnchor(): Promise<WaxUser | null> {
    try {
      const wallet = SimpleAnchorWallet.getInstance();
      const user = await wallet.login();
      
      if (user) {
        this.currentWallet = wallet;
        this.currentWalletType = WalletType.ANCHOR;
      }
      
      return user;
    } catch (error) {
      console.error("Anchor wallet login failed:", error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.currentWallet && this.currentWalletType === WalletType.ANCHOR) {
        (this.currentWallet as SimpleAnchorWallet).clearSession();
      }
      
      this.currentWallet = null;
      this.currentWalletType = null;
      
      localStorage.removeItem('pyrameme-session');
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out");
    }
  }

  async getBalance(account: string): Promise<WaxBalance> {
    try {
      if (!this.currentWallet) {
        return { waxp: "0.0000", pgl: "0.0000" };
      }

      const api = this.currentWallet.getApi();
      if (!api) {
        return { waxp: "0.0000", pgl: "0.0000" };
      }

      const balance = await api.rpc.get_currency_balance('eosio.token', account, 'WAX');
      
      return {
        waxp: Array.isArray(balance) && balance.length > 0 ? balance[0].split(' ')[0] : "0.0000",
        pgl: "0.0000"
      };
    } catch (error) {
      console.error("Failed to get balance:", error);
      return { waxp: "0.0000", pgl: "0.0000" };
    }
  }

  getApi(): any {
    return this.currentWallet?.getApi() || null;
  }
}

export const simpleWalletService = SimpleWalletService.getInstance();