import * as waxjs from "@waxio/waxjs/dist";
import { WaxUser } from "@/types/waxTypes";
import { toast } from "sonner";
import { WalletServiceBase } from "./baseWalletService";

export class CloudWalletService extends WalletServiceBase {
  private wax: waxjs.WaxJS | null = null;
  private isTestnet: boolean = false; // Set to false for mainnet default
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      // Create a polyfill for the browser environment
      if (typeof window !== 'undefined') {
        // @ts-ignore
        if (!window.global) window.global = window;
      }
      
      const rpcEndpoint = this.isTestnet 
        ? 'https://waxtestnet.greymass.com' 
        : 'https://wax.greymass.com';
      
      this.wax = new waxjs.WaxJS({
        rpcEndpoint,
        tryAutoLogin: false
      });
      
      console.log(`WAX Cloud Wallet service initialized (${this.isTestnet ? 'testnet' : 'mainnet'}) with endpoint: ${rpcEndpoint}`);
    } catch (error) {
      console.error("Error initializing WAX Cloud Wallet:", error);
      // Don't show toast error during initialization to avoid spam
      this.wax = null;
    }
  }

  async login(): Promise<WaxUser | null> {
    try {
      // Ensure wallet is initialized
      await this.initialize();
      
      if (!this.wax) {
        throw new Error("WAX Cloud Wallet failed to initialize");
      }

      toast.info("Connecting to WAX Cloud Wallet...");
      
      const userAccount = await this.wax.login();
      
      // Add timeout for network requests with better error handling
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Network request timeout")), 15000)
      );
      
      const pubKeysPromise = this.wax.api.rpc.get_account(userAccount);
      const pubKeys = await Promise.race([pubKeysPromise, timeoutPromise]) as any;
      
      const user: WaxUser = {
        account: userAccount,
        publicKey: pubKeys.permissions[0].required_auth.keys[0].key,
        permission: 'active'
      };
      
      toast.success(`Successfully logged in as ${user.account} on ${this.isTestnet ? 'testnet' : 'mainnet'}`);
      return user;
    } catch (error: any) {
      console.error("Cloud wallet login failed:", error);
      
      if (error.message?.includes("user closed the window")) {
        toast.info("Login cancelled by user");
      } else if (error.message?.includes("timeout")) {
        toast.error("Network timeout - trying demo mode might work better");
      } else if (error.message?.includes("Failed to fetch")) {
        toast.error("Network connection issue - you can still play in demo mode");
      } else {
        toast.error("Login failed - demo mode is available for testing");
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
    this.isTestnet = isTestnet;
    this.initializationPromise = null; // Reset initialization promise
    this.initialize();
  }
}
