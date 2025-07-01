
import { WaxUser, WaxBalance } from "@/types/waxTypes";

export interface BaseWalletService {
  login(): Promise<WaxUser | null>;
  isInitialized(): boolean;
  getApi(): any;
}

export abstract class WalletServiceBase implements BaseWalletService {
  protected developerWalletAddress: string = "sklam.wam"; // Updated to mainnet developer wallet
  
  abstract login(): Promise<WaxUser | null>;
  abstract isInitialized(): boolean;
  abstract getApi(): any;

  async getBalance(account: string): Promise<WaxBalance> {
    try {
      const api = this.getApi();
      if (!api) {
        console.warn("No API instance available for balance check");
        return {
          waxp: "0.0000",
          pgl: "0.0000"
        };
      }
      
      // Add timeout for balance requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Balance request timeout")), 8000)
      );
      
      const balancePromise = api.rpc.get_currency_balance('eosio.token', account, 'WAX');
      const pglPromise = api.rpc.get_currency_balance('prospectorsг', account, 'PGL');
      
      const [balance, pglBalance] = await Promise.all([
        Promise.race([balancePromise, timeoutPromise]).catch(() => ["0.0000 WAX"]),
        Promise.race([pglPromise, timeoutPromise]).catch(() => []) // PGL might not exist
      ]);
      
      return {
        waxp: Array.isArray(balance) && balance.length > 0 ? balance[0].split(' ')[0] : "0.0000",
        pgl: Array.isArray(pglBalance) && pglBalance.length > 0 ? pglBalance[0].split(' ')[0] : "0.0000"
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
