
import { toast } from "sonner";

export interface TransactionStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionId?: string;
  error?: string;
  timestamp: number;
  action: string;
  data?: any;
}

export class TransactionStatusService {
  private transactions: Map<string, TransactionStatus> = new Map();
  private statusCheckers: Map<string, NodeJS.Timeout> = new Map();

  constructor(private api: any) {}

  addTransaction(id: string, action: string, data?: any): void {
    const transaction: TransactionStatus = {
      id,
      status: 'pending',
      timestamp: Date.now(),
      action,
      data
    };
    
    this.transactions.set(id, transaction);
    toast.info(`Transaction ${action} submitted...`);
    
    // Start checking transaction status
    this.startStatusCheck(id);
  }

  updateTransaction(id: string, updates: Partial<TransactionStatus>): void {
    const transaction = this.transactions.get(id);
    if (transaction) {
      Object.assign(transaction, updates);
      this.transactions.set(id, transaction);
      
      if (updates.status === 'confirmed') {
        toast.success(`Transaction ${transaction.action} confirmed!`);
        this.stopStatusCheck(id);
      } else if (updates.status === 'failed') {
        toast.error(`Transaction ${transaction.action} failed: ${updates.error}`);
        this.stopStatusCheck(id);
      }
    }
  }

  private startStatusCheck(id: string): void {
    const checkInterval = setInterval(async () => {
      const transaction = this.transactions.get(id);
      if (!transaction || transaction.status !== 'pending') {
        clearInterval(checkInterval);
        return;
      }

      // Check if transaction is older than 2 minutes
      if (Date.now() - transaction.timestamp > 120000) {
        this.updateTransaction(id, {
          status: 'failed',
          error: 'Transaction timeout'
        });
        return;
      }

      // Try to fetch transaction status from blockchain
      if (transaction.transactionId) {
        try {
          const result = await this.api.rpc.get_transaction(transaction.transactionId);
          if (result) {
            this.updateTransaction(id, { status: 'confirmed' });
          }
        } catch (error) {
          // Transaction might still be processing or failed
          console.log("Transaction still processing:", id);
        }
      }
    }, 5000); // Check every 5 seconds

    this.statusCheckers.set(id, checkInterval);
  }

  private stopStatusCheck(id: string): void {
    const checker = this.statusCheckers.get(id);
    if (checker) {
      clearInterval(checker);
      this.statusCheckers.delete(id);
    }
  }

  getTransaction(id: string): TransactionStatus | undefined {
    return this.transactions.get(id);
  }

  getAllTransactions(): TransactionStatus[] {
    return Array.from(this.transactions.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  clearOldTransactions(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    for (const [id, transaction] of this.transactions.entries()) {
      if (transaction.timestamp < oneDayAgo) {
        this.stopStatusCheck(id);
        this.transactions.delete(id);
      }
    }
  }
}
