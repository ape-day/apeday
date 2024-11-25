import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export class JettonWallet implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
      return new JettonWallet(address);
    }


    async sendSell(provider: ContractProvider, via: Sender, poolAddress: Address, value: bigint, tokensValue: bigint, queryId = 0) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().
                storeUint(0xf8a7ea5, 32).
                storeUint(queryId, 64).
                storeCoins(tokensValue).
                storeAddress(poolAddress).
                storeAddress(null). // response_destination
                storeUint(0, 1). // custom payload
                storeCoins(toNano('0.1')).
                storeMaybeRef(beginCell().storeUint(0x9b9ed07d, 32).endCell()).
                endCell()
        })
    }

    async getCoins(provider: ContractProvider) {
      let state = await provider.getState();
      if (state.state.type !== 'active') {
          return 0n;
      }
      let res = await provider.get('get_wallet_data', []);
      return res.stack.readBigNumber();
    }
}
