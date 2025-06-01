
import AnchorLink from "anchor-link";
import AnchorLinkBrowserTransport from "anchor-link-browser-transport";
import { WaxUser } from "@/types/waxTypes";
import { toast } from "sonner";
import { WalletServiceBase } from "./baseWalletService";

export class AnchorWalletService extends WalletServiceBase {
  private anchorLink: AnchorLink | null = null;
  private anchorSession: any = null;

  constructor() {
    super();
    this.initialize();
  }

  private initialize(): void {
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

  async login(): Promise<WaxUser | null> {
    try {
      if (!this.anchorLink) {
        throw new Error("Anchor Wallet not initialized");
      }

      toast.info("Connecting to Anchor Wallet...");
      
      const identity = await this.anchorLink.login('Pyrameme Quest');
      this.anchorSession = identity.session;
      
      const user: WaxUser = {
        account: identity.account.toString(),
        publicKey: identity.session.publicKey.toString(),
        permission: identity.session.permission || 'active'
      };
      
      toast.success(`Successfully logged in as ${user.account}`);
      return user;
    } catch (error) {
      console.error("Anchor wallet login failed:", error);
      toast.error("Failed to log in with Anchor Wallet");
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
}
