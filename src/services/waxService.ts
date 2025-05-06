
import * as waxjs from "@waxio/waxjs/dist";
import AnchorLink from "anchor-link";
import AnchorLinkBrowserTransport from "anchor-link-browser-transport";
import { WalletType, WaxUser, WaxBalance } from "@/types/waxTypes";
import { toast } from "sonner";

class WaxWalletService {
  private wax: waxjs.WaxJS | null = null;
  private anchorLink: AnchorLink | null = null;
  private anchorSession: any = null;
  private developerWaxWallet: string = "wax.galaxy1"; // Replace with your developer wallet address
  
  constructor() {
    this.initializeWallets();
  }

  private initializeWallets(): void {
    // Initialize WAX Cloud Wallet
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

    // Initialize Anchor Wallet
    try {
      const transport = new AnchorLinkBrowserTransport();
      this.anchorLink = new AnchorLink({
        chains: [{
          chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
          nodeUrl: 'https://wax.greymass.com'
        }],
        transport: transport
      });
      console.log("Anchor Wallet service initialized");
    } catch (error) {
      console.error("Error initializing Anchor Wallet:", error);
    }
  }

  async loginWithCloudWallet(): Promise<WaxUser | null> {
    try {
      if (!this.wax) {
        throw new Error("WAX Cloud Wallet not initialized");
      }

      toast.info("Connecting to WAX Cloud Wallet...");
      
      // Attempt login with WAX Cloud Wallet
      const userAccount = await this.wax.login();
      const pubKeys = await this.wax.api.rpc.get_account(userAccount);
      
      const mockUser: WaxUser = {
        account: userAccount,
        publicKey: pubKeys.permissions[0].required_auth.keys[0].key,
        permission: 'active'
      };
      
      toast.success(`Successfully logged in as ${mockUser.account}`);
      return mockUser;
    } catch (error) {
      console.error("Cloud wallet login failed:", error);
      toast.error("Failed to log in with WAX Cloud Wallet");
      return null;
    }
  }

  async loginWithAnchorWallet(): Promise<WaxUser | null> {
    try {
      if (!this.anchorLink) {
        throw new Error("Anchor Wallet not initialized");
      }

      toast.info("Connecting to Anchor Wallet...");
      
      // Create identity request
      const identity = await this.anchorLink.login('Pyrameme Quest');
      this.anchorSession = identity.session;
      
      const mockUser: WaxUser = {
        account: identity.account,
        publicKey: identity.session.publicKey.toString(),
        permission: identity.permission
      };
      
      toast.success(`Successfully logged in as ${mockUser.account}`);
      return mockUser;
    } catch (error) {
      console.error("Anchor wallet login failed:", error);
      toast.error("Failed to log in with Anchor Wallet");
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      toast.info("Logging out...");
      
      // Clear session data
      this.anchorSession = null;
      
      // WAX Cloud Wallet doesn't have an explicit logout method, so we just clear our stored session
      localStorage.removeItem('pyrameme-session');
      
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out");
    }
  }

  async getBalance(account: string): Promise<WaxBalance> {
    try {
      // Get balance from WAX blockchain
      if (!this.wax && !this.anchorSession) {
        throw new Error("No wallet session available");
      }
      
      let api;
      if (this.wax) {
        api = this.wax.api;
      } else if (this.anchorSession) {
        api = this.anchorSession.api;
      } else {
        throw new Error("No API instance available");
      }
      
      const balance = await api.rpc.get_currency_balance('eosio.token', account, 'WAX');
      const pglBalance = await api.rpc.get_currency_balance('prospectorsг', account, 'PGL');
      
      return {
        waxp: balance.length > 0 ? balance[0].split(' ')[0] : "0.0000",
        pgl: pglBalance.length > 0 ? pglBalance[0].split(' ')[0] : "0.0000"
      };
    } catch (error) {
      console.error("Failed to get balance:", error);
      return {
        waxp: "0.0000",
        pgl: "0.0000"
      };
    }
  }

  async claimPlot(account: string, x: number, y: number): Promise<boolean> {
    try {
      console.log(`Claiming plot (${x}, ${y}) for account ${account}...`);
      toast.info("Processing transaction...");
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful transaction
      toast.success("Successfully claimed plot!");
      return true;
    } catch (error) {
      console.error("Failed to claim plot:", error);
      toast.error("Transaction failed");
      return false;
    }
  }

  async buyGold(account: string, waxAmount: number): Promise<boolean> {
    try {
      console.log(`Buying gold with ${waxAmount} WAXP for account ${account}`);
      toast.info(`Processing purchase of gold with ${waxAmount} WAXP...`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Successfully purchased gold with ${waxAmount} WAXP`);
      return true;
    } catch (error) {
      console.error("Failed to buy gold:", error);
      toast.error("Gold purchase transaction failed");
      return false;
    }
  }
  
  async payPlotFee(account: string, fee: number, ownerAccount: string | null): Promise<boolean> {
    try {
      console.log(`Paying ${fee} gold plot fee from ${account} to ${ownerAccount || "developer"}`);
      toast.info(`Processing ${fee} gold plot fee...`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Paid ${fee} gold plot fee`);
      return true;
    } catch (error) {
      console.error("Failed to pay plot fee:", error);
      toast.error("Plot fee transaction failed");
      return false;
    }
  }
  
  async collectTreasure(account: string, value: number): Promise<boolean> {
    try {
      console.log(`Collecting ${value} gold treasure for ${account}`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error("Failed to collect treasure:", error);
      return false;
    }
  }
  
  async requestWithdrawal(account: string, amount: number): Promise<boolean> {
    try {
      console.log(`Withdrawal request of ${amount} WAXP for ${account}`);
      toast.info("Processing withdrawal request...");
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Withdrawal request submitted. 72-hour waiting period begins.");
      return true;
    } catch (error) {
      console.error("Withdrawal request failed:", error);
      toast.error("Withdrawal request failed");
      return false;
    }
  }
  
  getDeveloperWalletAddress(): string {
    return this.developerWaxWallet;
  }
}

export const waxService = new WaxWalletService();
