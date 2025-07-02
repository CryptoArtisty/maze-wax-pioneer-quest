import AnchorLink from "anchor-link";
import AnchorLinkBrowserTransport from "anchor-link-browser-transport";
import { WaxUser } from "@/types/waxTypes";
import { toast } from "sonner";
import { WalletServiceBase } from "./baseWalletService";

export class AnchorWalletService extends WalletServiceBase {
  private anchorLink: AnchorLink | null = null;
  private anchorSession: any = null;
  private isTestnet: boolean = false; // Set to false for mainnet default

  constructor() {
    super();
    this.initialize();
  }

  private initialize(): void {
    try {
      const transport = new AnchorLinkBrowserTransport({
        // Enable request status callbacks for better UX
        requestStatus: true
      });
      
      const chainConfig = this.isTestnet ? {
        chainId: 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
        nodeUrl: 'https://waxtestnet.greymass.com'
      } : {
        chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
        nodeUrl: 'https://wax.greymass.com'
      };
      
      this.anchorLink = new AnchorLink({
        chains: [chainConfig],
        transport: transport
      });
      
      console.log(`Anchor Wallet service initialized (${this.isTestnet ? 'testnet' : 'mainnet'}) with endpoint: ${chainConfig.nodeUrl}`);
    } catch (error) {
      console.error("Error initializing Anchor Wallet:", error);
      toast.error("Failed to initialize Anchor Wallet");
    }
  }

  async login(): Promise<WaxUser | null> {
    try {
      if (!this.anchorLink) {
        throw new Error("Anchor Wallet not initialized");
      }

      toast.info("Opening Anchor Wallet...");
      
      // Use proper Anchor login with error handling
      const identity = await this.anchorLink.login('Pyrameme Quest');
      
      if (!identity || !identity.session) {
        throw new Error("No identity returned from Anchor login");
      }
      
      this.anchorSession = identity.session;
      
      const user: WaxUser = {
        account: identity.session.auth.actor.toString(),
        publicKey: identity.session.publicKey.toString(),
        permission: identity.session.auth.permission.toString()
      };
      
      toast.success(`Successfully logged in as ${user.account} on ${this.isTestnet ? 'testnet' : 'mainnet'}`);
      return user;
    } catch (error: any) {
      console.error("Anchor wallet login failed:", error);
      
      if (error.code === "E_CANCEL" || error.message?.includes("canceled") || error.message?.includes("cancelled")) {
        toast.info("Login cancelled by user");
      } else if (error.message?.includes("timeout")) {
        toast.error("Login timeout - please try again");
      } else if (error.message?.includes("No identity")) {
        toast.error("Failed to get identity from Anchor - please try again");
      } else {
        toast.error("Failed to log in with Anchor Wallet. Please ensure Anchor is installed and try again.");
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

  // Add method to switch between testnet and mainnet
  setTestnet(isTestnet: boolean): void {
    if (this.isTestnet !== isTestnet) {
      this.isTestnet = isTestnet;
      this.clearSession();
      this.initialize();
    }
  }
}
