
export interface PyramemeContractActions {
  claimplot: {
    player: string;
    x: number;
    y: number;
  };
  payfee: {
    player: string;
    amount: string;
    recipient: string;
  };
  buygold: {
    player: string;
    wax_amount: string;
  };
  collectgold: {
    player: string;
    amount: string;
  };
  withdraw: {
    player: string;
    amount: string;
  };
}

export interface PyramemeContractTables {
  players: {
    account: string;
    gold_balance: string;
    claimed_plots: Array<{x: number; y: number}>;
    last_activity: string;
  };
  plots: {
    x: number;
    y: number;
    owner: string;
    claimed_at: string;
    fee_rate: string;
  };
  treasury: {
    total_balance: string;
    round_number: number;
  };
}

export class PyramemeContract {
  private contractAccount: string = "pyramemegame"; // Replace with actual contract account
  
  constructor(private api: any) {}

  async claimPlot(player: string, x: number, y: number): Promise<any> {
    if (!this.api) {
      throw new Error("WAX API not available");
    }

    return await this.api.transact({
      actions: [{
        account: this.contractAccount,
        name: 'claimplot',
        authorization: [{
          actor: player,
          permission: 'active',
        }],
        data: {
          player,
          x,
          y
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
  }

  async payPlotFee(player: string, amount: string, recipient: string): Promise<any> {
    if (!this.api) {
      throw new Error("WAX API not available");
    }

    return await this.api.transact({
      actions: [{
        account: this.contractAccount,
        name: 'payfee',
        authorization: [{
          actor: player,
          permission: 'active',
        }],
        data: {
          player,
          amount,
          recipient
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
  }

  async buyGold(player: string, waxAmount: string): Promise<any> {
    if (!this.api) {
      throw new Error("WAX API not available");
    }

    // First transfer WAX to contract, then call buygold action
    return await this.api.transact({
      actions: [
        {
          account: 'eosio.token',
          name: 'transfer',
          authorization: [{
            actor: player,
            permission: 'active',
          }],
          data: {
            from: player,
            to: this.contractAccount,
            quantity: `${waxAmount} WAX`,
            memo: 'Buy gold for Pyrameme Quest'
          },
        },
        {
          account: this.contractAccount,
          name: 'buygold',
          authorization: [{
            actor: player,
            permission: 'active',
          }],
          data: {
            player,
            wax_amount: waxAmount
          },
        }
      ]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
  }

  async collectTreasure(player: string, amount: string): Promise<any> {
    if (!this.api) {
      throw new Error("WAX API not available");
    }

    return await this.api.transact({
      actions: [{
        account: this.contractAccount,
        name: 'collectgold',
        authorization: [{
          actor: player,
          permission: 'active',
        }],
        data: {
          player,
          amount
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
  }

  async requestWithdrawal(player: string, amount: string): Promise<any> {
    if (!this.api) {
      throw new Error("WAX API not available");
    }

    return await this.api.transact({
      actions: [{
        account: this.contractAccount,
        name: 'withdraw',
        authorization: [{
          actor: player,
          permission: 'active',
        }],
        data: {
          player,
          amount
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
  }

  async getPlayerData(account: string): Promise<PyramemeContractTables['players'] | null> {
    if (!this.api) {
      throw new Error("WAX API not available");
    }

    try {
      const result = await this.api.rpc.get_table_rows({
        json: true,
        code: this.contractAccount,
        scope: this.contractAccount,
        table: 'players',
        lower_bound: account,
        upper_bound: account,
        limit: 1
      });

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error fetching player data:", error);
      return null;
    }
  }

  async getPlotData(x: number, y: number): Promise<PyramemeContractTables['plots'] | null> {
    if (!this.api) {
      throw new Error("WAX API not available");
    }

    try {
      const plotId = x * 1000 + y; // Simple plot ID calculation
      const result = await this.api.rpc.get_table_rows({
        json: true,
        code: this.contractAccount,
        scope: this.contractAccount,
        table: 'plots',
        lower_bound: plotId,
        upper_bound: plotId,
        limit: 1
      });

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error fetching plot data:", error);
      return null;
    }
  }
}
