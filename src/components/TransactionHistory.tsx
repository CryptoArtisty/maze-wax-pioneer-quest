
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { waxService } from '@/services/waxService';
import { TransactionStatus } from '@/services/transactionStatusService';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = React.useState<TransactionStatus[]>([]);

  React.useEffect(() => {
    const updateTransactions = () => {
      setTransactions(waxService.getTransactionHistory());
    };

    updateTransactions();
    const interval = setInterval(updateTransactions, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'confirmed' ? 'default' : status === 'failed' ? 'destructive' : 'secondary';
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const openExplorer = (transactionId: string) => {
    const network = waxService.getCurrentNetwork();
    const url = `${network.explorerUrl}/transaction/${transactionId}`;
    window.open(url, '_blank');
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No transactions yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{tx.action}</span>
                {getStatusBadge(tx.status)}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(tx.timestamp).toLocaleString()}
              </div>
              {tx.error && (
                <div className="text-sm text-red-500 mt-1">
                  Error: {tx.error}
                </div>
              )}
            </div>
            {tx.transactionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExplorer(tx.transactionId!)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
