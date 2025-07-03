import AnchorLink from "anchor-link";
import AnchorLinkBrowserTransport from "anchor-link-browser-transport";
import { WaxUser } from "@/types/waxTypes";
import { toast } from "sonner";
import { WalletServiceBase } from "./baseWalletService";

export class AnchorWalletService extends WalletServiceBase {
  private anchorLink: AnchorLink | null = null;
  private anchorSession: any = null;
  private isTestnet: boolean = false;

  constructor() {
    super();
  }

  private async initializeAnchor(): Promise<void> {
    try {
      const transport = new AnchorLinkBrowserTransport({
        requestStatus: true
      });
      
      const chainConfig = this.isTestnet ? {
        chainId: 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
        nodeUrl: 'https://waxtestnet.greymass.com'
      } : {
        chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
        nodeUrl: 'https://wax.greymass.com'
      };
      
      console.log(`Initializing Anchor Wallet with endpoint: ${chainConfig.nodeUrl}`);
      
      this.anchorLink = new AnchorLink({
        chains: [chainConfig],
        transport: transport
      });
      
      console.log('Anchor Wallet initialized successfully');
    } catch (error) {
      console.error("Anchor Wallet initialization failed:", error);
      this.anchorLink = null;
      throw error;
    }
  }

  async login(): Promise<WaxUser | null> {
    try {
      console.log('Starting Anchor Wallet login...');
      
      // Initialize wallet on demand
      await this.initializeAnchor();
      
      if (!this.anchorLink) {
        throw new Error("Anchor Wallet initialization failed");
      }

      toast.info("Opening Anchor Wallet...");
      
      const identity = await this.anchorLink.login('Pyrameme Quest');
      console.log('Anchor login response:', identity);
      
      if (!identity || !identity.session) {
        throw new Error("No identity returned from Anchor login");
      }
      
      this.anchorSession = identity.session;
      
      const user: WaxUser = {
        account: identity.session.auth.actor.toString(),
        publicKey: identity.session.publicKey.toString(),
        permission: identity.session.auth.permission.toString()
      };
      
      console.log('Anchor Wallet login successful:', user);
      toast.success(`Connected to ${user.account}`);
      return user;
    } catch (error: any) {
      console.error("Anchor wallet login error:", error);
      
      if (error.code === "E_CANCEL" || error.message?.includes("cancel")) {
        toast.info("Login cancelled");
      } else if (error.message?.includes("timeout")) {
        toast.error("Login timeout - please try again");
      } else {
        toast.error("Anchor Wallet connection failed - please ensure Anchor is installed");
      }
      return null;
    }
  }

  isInitialized(): boolean {
    return this.anchorLink !== null;
  }

  getApi(): any {
    return this.anchorSession?.api || null;
  }

  clearSession(): void {
    this.anchorSession = null;
  }

  setTestnet(isTestnet: boolean): void {
    if (this.isTestnet !== isTestnet) {
      this.isTestnet = isTestnet;
      this.clearSession();
      this.anchorLink = null; // Clear existing instance
    }
  }
}
