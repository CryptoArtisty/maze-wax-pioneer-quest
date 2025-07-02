
import * as waxjs from "@waxio/waxjs/dist";
import { WaxUser } from "@/types/waxTypes";
import { toast } from "sonner";
import { WalletServiceBase } from "./baseWalletService";

export class CloudWalletService extends WalletServiceBase {
  private wax: waxjs.WaxJS | null = null;
  private isTestnet: boolean = false; // Set to false for mainnet default
  private initializationPromise: Promise<void> | null = null;
  private initializationAttempts: number = 0;
  private maxInitializationAttempts: number = 3;

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
      this.initializationAttempts++;
      
      // Create a polyfill for the browser environment
      if (typeof window !== 'undefined') {
        // @ts-ignore
        if (!window.global) window.global = window;
      }
      
      const rpcEndpoint = this.isTestnet 
        ? 'https://waxtestnet.greymass.com' 
        : 'https://wax.greymass.com';
      
      // Initialize with minimal configuration to prevent fetch errors during startup
      this.wax = new waxjs.WaxJS({
        rpcEndpoint,
        tryAutoLogin: false,
        userAccount: "",
        pubKeys: [],
        // Prevent automatic key fetching during initialization
        freeBandwidth: false
      });
      
      console.log(`WAX Cloud Wallet service initialized (${this.isTestnet ? 'testnet' : 'mainnet'}) with endpoint: ${rpcEndpoint}`);
    } catch (error) {
      console.error("Error initializing WAX Cloud Wallet:", error);
      this.wax = null;
      
      // Retry initialization if we haven't exceeded max attempts
      if (this.initializationAttempts < this.maxInitializationAttempts) {
        console.log(`Retrying WAX Cloud Wallet initialization (attempt ${this.initializationAttempts + 1}/${this.maxInitializationAttempts})`);
        this.initializationPromise = null;
        setTimeout(() => this.initialize(), 2000);
      }
    }
  }

  async login(): Promise<WaxUser | null> {
    try {
      // Ensure wallet is initialized
      await this.initialize();
      
      if (!this.wax) {
        throw new Error("WAX Cloud Wallet failed to initialize");
      }

      toast.info("Opening WAX Cloud Wallet...");
      
      // Use a more robust approach for login
      const userAccount = await this.wax.login();
      
      if (!userAccount) {
        throw new Error("No user account returned from login");
      }
      
      // Try to get account info with better error handling
      let publicKey = "";
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Account info timeout")), 10000)
        );
        
        const accountInfoPromise = this.wax.api.rpc.get_account(userAccount);
        const accountInfo = await Promise.race([accountInfoPromise, timeoutPromise]) as any;
        
        if (accountInfo && accountInfo.permissions && accountInfo.permissions.length > 0) {
          publicKey = accountInfo.permissions[0].required_auth.keys[0].key;
        }
      } catch (error) {
        console.warn("Could not fetch account info, using placeholder:", error);
        // Use a placeholder public key if we can't fetch it
        publicKey = "EOS5...placeholder";
      }
      
      const user: WaxUser = {
        account: userAccount,
        publicKey: publicKey,
        permission: 'active'
      };
      
      toast.success(`Successfully logged in as ${user.account} on ${this.isTestnet ? 'testnet' : 'mainnet'}`);
      return user;
    } catch (error: any) {
      console.error("Cloud wallet login failed:", error);
      
      if (error.message?.includes("user closed the window") || error.message?.includes("User rejected")) {
        toast.info("Login cancelled by user");
      } else if (error.message?.includes("timeout")) {
        toast.error("Connection timeout - please try again or use demo mode");
      } else if (error.message?.includes("Failed to fetch") || error.message?.includes("fetch")) {
        toast.error("Network connection issue - you can still play in demo mode");
      } else if (error.message?.includes("initialize")) {
        toast.error("Wallet initialization failed - demo mode is available");
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
    if (this.isTestnet !== isTestnet) {
      this.isTestnet = isTestnet;
      this.initializationPromise = null; // Reset initialization promise
      this.initializationAttempts = 0; // Reset attempt counter
      this.wax = null; // Clear existing instance
      this.initialize();
    }
  }
}
