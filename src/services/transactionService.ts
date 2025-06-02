
import { toast } from "sonner";
import { PyramemeContract } from "./contracts/pyramemeContract";
import { TransactionStatusService } from "./transactionStatusService";
import { NetworkConfigService } from "./networkConfigService";

export class TransactionService {
  private contract: PyramemeContract | null = null;
  private statusService: TransactionStatusService | null = null;
  private networkConfig = NetworkConfigService.getInstance();
  private developerWallet: string = "wax.galaxy1";

  setApi(api: any): void {
    if (api) {
      this.contract = new PyramemeContract(api);
      this.statusService = new TransactionStatusService(api);
    }
  }

  async claimPlot(account: string, x: number, y: number): Promise<boolean> {
    if (!this.contract) {
      console.log("Contract not available, using simulation");
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
      console.error("Failed to claim plot:", error);
      
      if (error.message?.includes("insufficient resources")) {
        toast.error("Insufficient CPU/NET resources. Please stake more WAX or wait.");
      } else if (error.message?.includes("plot already claimed")) {
        toast.error("This plot has already been claimed by another player.");
      } else if (error.message?.includes("insufficient gold")) {
        toast.error("Insufficient gold balance to claim this plot.");
      } else {
        toast.error(`Transaction failed: ${error.message || "Unknown error"}`);
      }
      
      return false;
    }
  }

  async buyGold(account: string, waxAmount: number): Promise<boolean> {
    if (!this.contract) {
      console.log("Contract not available, using simulation");
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
      console.error("Failed to buy gold:", error);
      
      if (error.message?.includes("insufficient balance")) {
        toast.error("Insufficient WAXP balance for this purchase.");
      } else if (error.message?.includes("minimum purchase")) {
        toast.error("Minimum purchase amount not met.");
      } else {
        toast.error(`Gold purchase failed: ${error.message || "Unknown error"}`);
      }
      
      return false;
    }
  }
  
  async payPlotFee(account: string, fee: number, ownerAccount: string | null): Promise<boolean> {
    if (!this.contract) {
      console.log("Contract not available, using simulation");
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
      console.error("Failed to pay plot fee:", error);
      toast.error(`Plot fee payment failed: ${error.message || "Unknown error"}`);
      return false;
    }
  }
  
  async collectTreasure(account: string, value: number): Promise<boolean> {
    if (!this.contract) {
      console.log("Contract not available, using simulation");
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
      console.error("Failed to collect treasure:", error);
      return false;
    }
  }
  
  async requestWithdrawal(account: string, amount: number): Promise<boolean> {
    if (!this.contract) {
      console.log("Contract not available, using simulation");
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
      console.error("Withdrawal request failed:", error);
      toast.error(`Withdrawal failed: ${error.message || "Unknown error"}`);
      return false;
    }
  }

  // Simulation methods for testing when contract is not available
  private async simulateClaimPlot(account: string, x: number, y: number): Promise<boolean> {
    console.log(`[SIMULATION] Claiming plot (${x}, ${y}) for account ${account}...`);
    toast.info("Processing transaction...");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success("Successfully claimed plot!");
    return true;
  }

  private async simulateBuyGold(account: string, waxAmount: number): Promise<boolean> {
    console.log(`[SIMULATION] Buying gold with ${waxAmount} WAXP for account ${account}`);
    toast.info(`Processing purchase of gold with ${waxAmount} WAXP...`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Successfully purchased gold with ${waxAmount} WAXP`);
    return true;
  }

  private async simulatePayPlotFee(account: string, fee: number, ownerAccount: string | null): Promise<boolean> {
    console.log(`[SIMULATION] Paying ${fee} gold plot fee from ${account} to ${ownerAccount || "developer"}`);
    toast.info(`Processing ${fee} gold plot fee...`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Paid ${fee} gold plot fee`);
    return true;
  }

  private async simulateCollectTreasure(account: string, value: number): Promise<boolean> {
    console.log(`[SIMULATION] Collecting ${value} gold treasure for ${account}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  private async simulateRequestWithdrawal(account: string, amount: number): Promise<boolean> {
    console.log(`[SIMULATION] Withdrawal request of ${amount} WAXP for ${account}`);
    toast.info("Processing withdrawal request...");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Withdrawal request submitted. 72-hour waiting period begins.");
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
