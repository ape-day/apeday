import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export type PoolConfig = {};

export function preprarePoolData(jettonMinterAddress: Address): Cell {
    return beginCell().storeAddress(jettonMinterAddress).endCell();
}

export type ReservesData = {
    tokensLeft: bigint,
    tokensTotal: bigint
};

export type JettonWaleltData = {
    address: Address
};

export type ExchangeRateData = {
    tokensAmount: bigint,
    excess: bigint
};

export type TonExchangeRateData = {
    tonAmount: bigint
};

export type getFee = {
    fee: bigint
};

export type getBalance = {
    balance: bigint
};

export class Pool implements Contract {
    static readonly code = Cell.fromBase64('te6cckECGgEABVcAART/APSkE/S88sgLAQIBYgIPAgLNAw4CASAEDQL3Qy0NMDAXGwkl8D4PpA+kAx+gAwAtMf0z/tRND6QCDXScIAnX8B+kD6QPoA+gAwEEWYMHBtbVMiEEXighDecU9SUpC6BrMWsI4mEDRfBFBWXwX6QPoA+kAwURDIUAXPFlADzxYBzxYB+gIB+gLJ7VTgghBhF9E7UoC64wKAUJBNg3KPAHU5ChUruhVCqAUmDbPCbHAo5EBtQw0PpAMFRjISlwIIIQD4p+pcjLHxPLP1AD+gJQA88WEssCIfoCywBwgBDIywVQA88WggpD1YD6AhLLagHPF8lz+wDjDYIQlklktXMjTBNUSdDbPCQXBgwHAHw2VHKAKXAgghAPin6lyMsfE8s/UAP6AlADzxYSywIh+gLLAHCAEMjLBVADzxaCCkPVgPoCEstqAc8XyXP7AAP+jo6CENUydtsQOEVgc9s8EpUQJzQ0MOJQNaGCKsaK8LsUAABSELuOzlRhMFQiIHBwIIIQD4p+pcjLHxPLP1AD+gJQA88WEssCIfoCywBwgBDIywVQA88WggpD1YD6AhLLagHPF8lz+wBwIIIQlShHaIEAoNs8cN6CElQL5AAWvgwMCAHOjs1UcBRUIiBwcCCCEA+KfqXIyx8Tyz9QA/oCUAPPFhLLAiH6AssAcIAQyMsFUAPPFoIKQ9WA+gISy2oBzxfJc/sAcCCCEJUoR2iBAKDbPN5BQ8hQBc8WUAPPFgHPFgH6AgH6AsntVAwBWjk5ghBzYtCcUhjHBRewFbqOlwH6APpA1DDQ0x8wghCbntB9upJfCOMNkl8H4goC/lRxYvgnbyIwghA7msoAghA7msoAFahQI6GCKsaK8LsUAACgEqkEEqGCGAXv6x8AEqCCEDuaygACdPACghA7msoAc/ACqQQSoaiCEDuaygCpBFByoCHwB14yVEgGyFAFzxZQA88WAc8WAfoCAfoCye1UghCWSWS1FXMjVEcw2zwMCwEMoVhwc9s8DAA2cIAQyMsFUAbPFlAE+gIUy2oTyx8Syz/JAfsAAEVCDAAJJbceAgwAGRMOAgqwBSIPACIKgBqTgAwAGSAaiRMeKAAN9AMlSCOtRAIBIBATAgHHERIATazZ9qJofSAQa6ThAE6/gP0gfSB9AH0AGAgizBg4NrapkQgi8TYhQABRrlt2omh9IBBrpOEATr+A/SB9IH0AfQAYCCLMGDg2tqmRCCLxCBqvgsACASAUFQAPuWwPgnbyIwgCAUgWGQFfsL++CdvIjDtRND6QCDXScIAnX8B+kD6QPoA+gAwEEWYMHBtbVMiEEXiNTNbAts8gFwH0ghA7msoAghA7msoAFaiCGAXv6x8AEqCpBBOgghA7msoAqCDAAI5QgQC1UxGDf76ZMat/gQC1qj8B3iCDP76Wqz8Bqh8B3iCDH76Wqx8Bqg8B3iCDD76Wqw8BqgcB3oMPoKirEXeWXKkEoKsA5GapBFy5kTCRMeLfWaEYAPKCKsaK8LsUAACgghA7msoAEqggwACOUIEAtVMRg3++mTGrf4EAtao/Ad4ggz++lqs/AaofAd4ggx++lqsfAaoPAd4ggw++lqsPAaoHAd6DD6CoqxF3llypBKCrAORmqQRcuZEwkTHi34IQO5rKAKGoghA7msoAqQRwAOmzoztRND6QCDXScIAnX8B+kD6QPoA+gAwEEWYMHBtbVMiEEXibEL4J28iMIIQO5rKAIIQO5rKABWoUCOhgirGivC7FAAAoBKpBBKhghgF7+sfABKgghA7msoAAnTwAoIQO5rKAHPwAqkEEqGoghA7msoAqQSC8T0R7')

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Pool(address);
    }

    static createFromConfig(jettonMinterAddress: Address, code: Cell, workchain = 0) {
        const data = preprarePoolData(jettonMinterAddress);
        const init = { code, data };
        return new Pool(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint, jettonWalletAddress: Address, supply: bigint, deployerAddress: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().
                storeUint(0xde714f52, 32).
                storeUint(0, 64).
                storeAddress(jettonWalletAddress).
                storeCoins(supply).
                storeAddress(deployerAddress).
                endCell(),
        });
    }

    async sendPurchase(provider: ContractProvider, via: Sender, value: bigint, queryId = 0) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().
                storeUint(0x6117d13b, 32).
                storeUint(queryId, 64).
                endCell()
        });
    }

    async getReserves(provider: ContractProvider): Promise<ReservesData> {
        const res = await provider.get('get_reserves', [])

        return { tokensLeft: res.stack.readBigNumber(), tokensTotal: res.stack.readBigNumber() };
    }

    async getJettonWallet(provider: ContractProvider): Promise<JettonWaleltData> {
        const res = await provider.get('get_jetton_wallet', [])

        return { address: res.stack.readAddress() };
    }

    async getExchangeRate(provider: ContractProvider, tonAmount: bigint): Promise<ExchangeRateData> {
        const res = await provider.get('get_exchange_rate', [ {type: 'int', value: tonAmount} ])

        return { tokensAmount: res.stack.readBigNumber(), excess: res.stack.readBigNumber() };
    }

    async getTonExchangeRate(provider: ContractProvider, tokenAmount: bigint): Promise<TonExchangeRateData> {
        const res = await provider.get('get_ton_exchange_rate', [ {type: 'int', value: tokenAmount} ])

        return { tonAmount: res.stack.readBigNumber() };
    }

    async getBalance(provider: ContractProvider): Promise<getBalance> {
        const res = await provider.get('balance', [ ])

        return { balance: res.stack.readBigNumber() };
    }
}
