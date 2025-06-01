
import * as waxjs from "@waxio/waxjs/dist";
import { WaxUser } from "@/types/waxTypes";
import { toast } from "sonner";
import { WalletServiceBase } from "./baseWalletService";

export class CloudWalletService extends WalletServiceBase {
  private wax: waxjs.WaxJS | null = null;

  constructor() {
    super();
    this.initialize();
  }

  private initialize(): void {
    try {
      // Create a polyfill for the browser environment
      if (typeof window !== 'undefined') {
        // @ts-ignore
        if (!window.global) window.global = window;
      }
      
      this.wax = new waxjs.WaxJS({
        rpcEndpoint: 'https://wax.greymass.com',
        tryAutoLogin: false
      });
      console.log("WAX Cloud Wallet service initialized");
    } catch (error) {
      console.error("Error initializing WAX Cloud Wallet:", error);
    }
  }

  async login(): Promise<WaxUser | null> {
    try {
      if (!this.wax) {
        throw new Error("WAX Cloud Wallet not initialized");
      }

      toast.info("Connecting to WAX Cloud Wallet...");
      
      const userAccount = await this.wax.login();
      const pubKeys = await this.wax.api.rpc.get_account(userAccount);
      
      const user: WaxUser = {
        account: userAccount,
        publicKey: pubKeys.permissions[0].required_auth.keys[0].key,
        permission: 'active'
      };
      
      toast.success(`Successfully logged in as ${user.account}`);
      return user;
    } catch (error) {
      console.error("Cloud wallet login failed:", error);
      toast.error("Failed to log in with WAX Cloud Wallet");
      return null;
    }
  }

  isInitialized(): boolean {
    return this.wax !== null;
  }

  getApi(): any {
    return this.wax?.api || null;
  }
}
