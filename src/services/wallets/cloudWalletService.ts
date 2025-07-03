
import * as waxjs from "@waxio/waxjs/dist";
import { WaxUser } from "@/types/waxTypes";
import { toast } from "sonner";
import { WalletServiceBase } from "./baseWalletService";

export class CloudWalletService extends WalletServiceBase {
  private wax: waxjs.WaxJS | null = null;
  private isTestnet: boolean = false;

  constructor() {
    super();
  }

  private async initializeWax(): Promise<void> {
    try {
      // Browser polyfill
      if (typeof window !== 'undefined' && !window.global) {
        // @ts-ignore
        window.global = window;
      }
      
      const rpcEndpoint = this.isTestnet 
        ? 'https://waxtestnet.greymass.com' 
        : 'https://wax.greymass.com';
      
      console.log(`Initializing WAX Cloud Wallet with endpoint: ${rpcEndpoint}`);
      
      this.wax = new waxjs.WaxJS({
        rpcEndpoint,
        tryAutoLogin: false
      });
      
      console.log('WAX Cloud Wallet initialized successfully');
    } catch (error) {
      console.error("WAX Cloud Wallet initialization failed:", error);
      this.wax = null;
      throw error;
    }
  }

  async login(): Promise<WaxUser | null> {
    try {
      console.log('Starting WAX Cloud Wallet login...');
      
      // Initialize wallet on demand
      await this.initializeWax();
      
      if (!this.wax) {
        throw new Error("WAX Cloud Wallet failed to initialize");
      }

      toast.info("Opening WAX Cloud Wallet...");
      
      const userAccount = await this.wax.login();
      console.log('WAX login response:', userAccount);
      
      if (!userAccount) {
        throw new Error("No user account returned from login");
      }
      
      // Get public key safely
      let publicKey = "EOS...connected";
      try {
        if (this.wax.pubKeys && this.wax.pubKeys.length > 0) {
          publicKey = this.wax.pubKeys[0];
        }
      } catch (error) {
        console.warn("Could not get public key:", error);
      }
      
      const user: WaxUser = {
        account: userAccount,
        publicKey: publicKey,
        permission: 'active'
      };
      
      console.log('WAX Cloud Wallet login successful:', user);
      toast.success(`Connected to ${user.account}`);
      return user;
    } catch (error: any) {
      console.error("WAX Cloud Wallet login error:", error);
      
      if (error.message?.includes("user closed") || error.message?.includes("User rejected")) {
        toast.info("Login cancelled");
      } else if (error.message?.includes("timeout")) {
        toast.error("Connection timeout - please try again");
      } else {
        toast.error("WAX Cloud Wallet connection failed");
      }
      return null;
    }
  }

  isInitialized(): boolean {
    return this.wax !== null;
  }

  getApi(): any {
    return this.wax?.api || null;
  }

  setTestnet(isTestnet: boolean): void {
    if (this.isTestnet !== isTestnet) {
      this.isTestnet = isTestnet;
      this.wax = null; // Clear existing instance
    }
  }
}
