import AnchorLink from "anchor-link";
import AnchorLinkBrowserTransport from "anchor-link-browser-transport";
import { WaxUser } from "@/types/waxTypes";
import { toast } from "sonner";

export class SimpleAnchorWallet {
  private static instance: SimpleAnchorWallet;
  private anchorLink: AnchorLink | null = null;
  private session: any = null;

  private constructor() {}

  static getInstance(): SimpleAnchorWallet {
    if (!SimpleAnchorWallet.instance) {
      SimpleAnchorWallet.instance = new SimpleAnchorWallet();
    }
    return SimpleAnchorWallet.instance;
  }

  async login(): Promise<WaxUser | null> {
    try {
      console.log('Starting Anchor Wallet login...');
      
      // Create fresh instance for each login
      const transport = new AnchorLinkBrowserTransport({
        requestStatus: true
      });
      
      this.anchorLink = new AnchorLink({
        chains: [{
          chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
          nodeUrl: 'https://wax.greymass.com'
        }],
        transport: transport
      });

      toast.info("Opening Anchor Wallet...");
      
      const identity = await this.anchorLink.login('Pyrameme Quest');
      
      if (!identity?.session) {
        throw new Error("No session returned from Anchor");
      }
      
      this.session = identity.session;
      
      const user: WaxUser = {
        account: identity.session.auth.actor.toString(),
        publicKey: identity.session.publicKey.toString(),
        permission: identity.session.auth.permission.toString()
      };
      
      console.log('Anchor Wallet login successful:', user);
      toast.success(`Connected to ${user.account}`);
      return user;
    } catch (error: any) {
      console.error("Anchor wallet error:", error);
      
      if (error.code === "E_CANCEL" || error.message?.includes("cancel")) {
        toast.info("Login cancelled");
      } else {
        toast.error("Anchor Wallet connection failed - ensure Anchor is installed");
      }
      return null;
    }
  }

  getApi(): any {
    return this.session?.api || null;
  }

  clearSession(): void {
    this.session = null;
    this.anchorLink = null;
  }
}