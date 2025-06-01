
import * as waxjs from "@waxio/waxjs/dist";
import { WaxUser } from "@/types/waxTypes";
import { toast } from "sonner";
import { WalletServiceBase } from "./baseWalletService";

export class CloudWalletService extends WalletServiceBase {
  private wax: waxjs.WaxJS | null = null;
  private isTestnet: boolean = true; // Set to false for mainnet

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
      
      const rpcEndpoint = this.isTestnet 
        ? 'https://testnet.waxsweden.org' 
        : 'https://wax.greymass.com';
      
      this.wax = new waxjs.WaxJS({
        rpcEndpoint,
        tryAutoLogin: false
      });
      console.log(`WAX Cloud Wallet service initialized (${this.isTestnet ? 'testnet' : 'mainnet'})`);
    } catch (error) {
      console.error("Error initializing WAX Cloud Wallet:", error);
      toast.error("Failed to initialize WAX Cloud Wallet");
    }
  }

  async login(): Promise<WaxUser | null> {
    try {
      if (!this.wax) {
        throw new Error("WAX Cloud Wallet not initialized");
      }

      toast.info("Connecting to WAX Cloud Wallet...");
      
      const userAccount = await this.wax.login();
      
      // Add timeout for network requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Network request timeout")), 10000)
      );
      
      const pubKeysPromise = this.wax.api.rpc.get_account(userAccount);
      const pubKeys = await Promise.race([pubKeysPromise, timeoutPromise]) as any;
      
      const user: WaxUser = {
        account: userAccount,
        publicKey: pubKeys.permissions[0].required_auth.keys[0].key,
        permission: 'active'
      };
      
      toast.success(`Successfully logged in as ${user.account}`);
      return user;
    } catch (error: any) {
      console.error("Cloud wallet login failed:", error);
      
      if (error.message?.includes("user closed the window")) {
        toast.info("Login cancelled by user");
      } else if (error.message?.includes("timeout")) {
        toast.error("Network timeout - please check your connection and try again");
      } else {
        toast.error("Failed to log in with WAX Cloud Wallet. Please try again.");
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

  // Add method to switch between testnet and mainnet
  setTestnet(isTestnet: boolean): void {
    this.isTestnet = isTestnet;
    this.initialize();
  }
}
