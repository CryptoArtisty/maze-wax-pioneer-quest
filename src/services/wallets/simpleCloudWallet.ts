import * as waxjs from "@waxio/waxjs/dist";
import { WaxUser } from "@/types/waxTypes";
import { toast } from "sonner";

export class SimpleCloudWallet {
  private static instance: SimpleCloudWallet;
  private wax: waxjs.WaxJS | null = null;

  private constructor() {}

  static getInstance(): SimpleCloudWallet {
    if (!SimpleCloudWallet.instance) {
      SimpleCloudWallet.instance = new SimpleCloudWallet();
    }
    return SimpleCloudWallet.instance;
  }

  async login(): Promise<WaxUser | null> {
    try {
      console.log('Starting WAX Cloud Wallet login...');
      
      // Create fresh instance for each login attempt
      this.wax = new waxjs.WaxJS({
        rpcEndpoint: 'https://wax.greymass.com',
        tryAutoLogin: false
      });

      toast.info("Opening WAX Cloud Wallet...");
      
      const userAccount = await this.wax.login();
      
      if (!userAccount) {
        throw new Error("No user account returned");
      }
      
      const publicKey = this.wax.pubKeys?.[0] || "connected";
      
      const user: WaxUser = {
        account: userAccount,
        publicKey: publicKey,
        permission: 'active'
      };
      
      console.log('WAX Cloud Wallet login successful:', user);
      toast.success(`Connected to ${user.account}`);
      return user;
    } catch (error: any) {
      console.error("WAX Cloud Wallet error:", error);
      
      if (error.message?.includes("user closed") || error.message?.includes("User rejected")) {
        toast.info("Login cancelled");
      } else {
        toast.error("WAX Cloud Wallet connection failed");
      }
      return null;
    }
  }

  getApi(): any {
    return this.wax?.api || null;
  }
}