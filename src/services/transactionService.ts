
import { toast } from "sonner";
import { PyramemeContract } from "./contracts/pyramemeContract";
import { TransactionStatusService } from "./transactionStatusService";
import { NetworkConfigService } from "./networkConfigService";

export class TransactionService {
  private contract: PyramemeContract | null = null;
  private statusService: TransactionStatusService | null = null;
  private networkConfig = NetworkConfigService.getInstance();
  private developerWallet: string = "wax.galaxy1";
  private simulationMode: boolean = false;

  setApi(api: any): void {
    if (api) {
      this.contract = new PyramemeContract(api);
      this.statusService = new TransactionStatusService(api);
      this.simulationMode = false;
    } else {
      this.simulationMode = true;
    }
  }

  async claimPlot(account: string, x: number, y: number): Promise<boolean> {
    // Always check network health first
    const isNetworkHealthy = await this.networkConfig.checkNetworkHealth();
    
    if (!this.contract || !isNetworkHealthy || this.simulationMode) {
      return this.simulateClaimPlot(account, x, y);
    }

    try {
      const transactionId = `claim-${account}-${x}-${y}-${Date.now()}`;
      this.statusService?.addTransaction(transactionId, 'Claim Plot', { x, y });

      const result = await this.contract.claimPlot(account, x, y);
      
      this.statusService?.updateTransaction(transactionId, {
        status: 'confirmed',
        transactionId: result.transaction_id
      });

      const explorerUrl = this.networkConfig.getExplorerUrl(result.transaction_id);
      toast.success(`Plot claimed successfully! View on explorer: ${explorerUrl}`);
      
      return true;
    } catch (error: any) {
      console.error("Failed to claim plot, falling back to simulation:", error);
      return this.simulateClaimPlot(account, x, y);
    }
  }

  async buyGold(account: string, waxAmount: number): Promise<boolean> {
    const isNetworkHealthy = await this.networkConfig.checkNetworkHealth();
    
    if (!this.contract || !isNetworkHealthy || this.simulationMode) {
      return this.simulateBuyGold(account, waxAmount);
    }

    try {
      const transactionId = `buygold-${account}-${waxAmount}-${Date.now()}`;
      this.statusService?.addTransaction(transactionId, 'Buy Gold', { waxAmount });

      const result = await this.contract.buyGold(account, waxAmount.toFixed(4));
      
      this.statusService?.updateTransaction(transactionId, {
        status: 'confirmed',
        transactionId: result.transaction_id
      });

      const goldAmount = waxAmount * 1000;
      const explorerUrl = this.networkConfig.getExplorerUrl(result.transaction_id);
      toast.success(`Purchased ${goldAmount} gold for ${waxAmount} WAXP! View: ${explorerUrl}`);
      
      return true;
    } catch (error: any) {
      console.error("Failed to buy gold, falling back to simulation:", error);
      return this.simulateBuyGold(account, waxAmount);
    }
  }
  
  async payPlotFee(account: string, fee: number, ownerAccount: string | null): Promise<boolean> {
    const isNetworkHealthy = await this.networkConfig.checkNetworkHealth();
    
    if (!this.contract || !isNetworkHealthy || this.simulationMode) {
      return this.simulatePayPlotFee(account, fee, ownerAccount);
    }

    try {
      const recipient = ownerAccount || this.developerWallet;
      const transactionId = `fee-${account}-${fee}-${Date.now()}`;
      this.statusService?.addTransaction(transactionId, 'Pay Plot Fee', { fee, recipient });

      const result = await this.contract.payPlotFee(account, fee.toFixed(4), recipient);
      
      this.statusService?.updateTransaction(transactionId, {
        status: 'confirmed',
        transactionId: result.transaction_id
      });

      const explorerUrl = this.networkConfig.getExplorerUrl(result.transaction_id);
      toast.success(`Paid ${fee} gold plot fee! View: ${explorerUrl}`);
      
      return true;
    } catch (error: any) {
      console.error("Failed to pay plot fee, falling back to simulation:", error);
      return this.simulatePayPlotFee(account, fee, ownerAccount);
    }
  }
  
  async collectTreasure(account: string, value: number): Promise<boolean> {
    const isNetworkHealthy = await this.networkConfig.checkNetworkHealth();
    
    if (!this.contract || !isNetworkHealthy || this.simulationMode) {
      return this.simulateCollectTreasure(account, value);
    }

    try {
      const transactionId = `collect-${account}-${value}-${Date.now()}`;
      this.statusService?.addTransaction(transactionId, 'Collect Treasure', { value });

      const result = await this.contract.collectTreasure(account, value.toFixed(4));
      
      this.statusService?.updateTransaction(transactionId, {
        status: 'confirmed',
        transactionId: result.transaction_id
      });

      return true;
    } catch (error: any) {
      console.error("Failed to collect treasure, falling back to simulation:", error);
      return this.simulateCollectTreasure(account, value);
    }
  }
  
  async requestWithdrawal(account: string, amount: number): Promise<boolean> {
    const isNetworkHealthy = await this.networkConfig.checkNetworkHealth();
    
    if (!this.contract || !isNetworkHealthy || this.simulationMode) {
      return this.simulateRequestWithdrawal(account, amount);
    }

    try {
      const transactionId = `withdraw-${account}-${amount}-${Date.now()}`;
      this.statusService?.addTransaction(transactionId, 'Request Withdrawal', { amount });

      const result = await this.contract.requestWithdrawal(account, amount.toFixed(4));
      
      this.statusService?.updateTransaction(transactionId, {
        status: 'confirmed',
        transactionId: result.transaction_id
      });

      const explorerUrl = this.networkConfig.getExplorerUrl(result.transaction_id);
      toast.success(`Withdrawal request submitted! View: ${explorerUrl}`);
      
      return true;
    } catch (error: any) {
      console.error("Withdrawal request failed, falling back to simulation:", error);
      return this.simulateRequestWithdrawal(account, amount);
    }
  }

  // Enhanced simulation methods with better user feedback
  private async simulateClaimPlot(account: string, x: number, y: number): Promise<boolean> {
    console.log(`[SIMULATION] Claiming plot (${x}, ${y}) for account ${account}...`);
    toast.info("Processing in demo mode...");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Plot claimed successfully! (Demo mode)");
    return true;
  }

  private async simulateBuyGold(account: string, waxAmount: number): Promise<boolean> {
    console.log(`[SIMULATION] Buying gold with ${waxAmount} WAXP for account ${account}`);
    toast.info(`Processing purchase in demo mode...`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const goldAmount = waxAmount * 1000;
    toast.success(`Purchased ${goldAmount} gold! (Demo mode)`);
    return true;
  }

  private async simulatePayPlotFee(account: string, fee: number, ownerAccount: string | null): Promise<boolean> {
    console.log(`[SIMULATION] Paying ${fee} gold plot fee from ${account} to ${ownerAccount || "treasury"}`);
    toast.info(`Processing ${fee} gold fee in demo mode...`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success(`Paid ${fee} gold fee! (Demo mode)`);
    return true;
  }

  private async simulateCollectTreasure(account: string, value: number): Promise<boolean> {
    console.log(`[SIMULATION] Collecting ${value} gold treasure for ${account}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }

  private async simulateRequestWithdrawal(account: string, amount: number): Promise<boolean> {
    console.log(`[SIMULATION] Withdrawal request of ${amount} WAXP for ${account}`);
    toast.info("Processing withdrawal in demo mode...");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Withdrawal processed! (Demo mode)");
    return true;
  }

  getDeveloperWalletAddress(): string {
    return this.developerWallet;
  }

  getTransactionHistory(): any[] {
    return this.statusService?.getAllTransactions() || [];
  }

  static isMainnet(): boolean {
    return !NetworkConfigService.getInstance().isTestnet();
  }
}
