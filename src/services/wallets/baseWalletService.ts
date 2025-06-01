
import { WaxUser, WaxBalance } from "@/types/waxTypes";

export interface BaseWalletService {
  login(): Promise<WaxUser | null>;
  isInitialized(): boolean;
  getApi(): any;
}

export abstract class WalletServiceBase implements BaseWalletService {
  protected developerWalletAddress: string = "wax.galaxy1";
  
  abstract login(): Promise<WaxUser | null>;
  abstract isInitialized(): boolean;
  abstract getApi(): any;

  async getBalance(account: string): Promise<WaxBalance> {
    try {
      const api = this.getApi();
      if (!api) {
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

  getDeveloperWalletAddress(): string {
    return this.developerWalletAddress;
  }
}
