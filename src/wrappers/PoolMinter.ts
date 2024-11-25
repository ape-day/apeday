import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode } from '@ton/core';
import { Pool } from './Pool';

export function preprarePoolMinterData(ownerAddress: Address, mintFee: bigint, poolCodeCell: Cell, minterCode: Cell, jettonWalletCode: Cell): Cell {
    const dict = Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.Cell())
    return beginCell().storeAddress(ownerAddress).storeCoins(mintFee).storeRef(poolCodeCell).storeRef(minterCode).storeRef(jettonWalletCode).storeDict(dict).endCell();
}

export type addressesData = {
    minterAddress: Address,
    poolAddress: Address
};

export class PoolMinter implements Contract {
    static readonly minterCode = Cell.fromBase64('te6ccgECDQEAApwAART/APSkE/S88sgLAQIBYgIDAgLMBAUCA3pgCwwC8dkGOASS+B8ADoaYGAuNhJL4HwfSB9IBj9ABi465D9ABj9ABgBaY/pn/aiaH0AfSBqahhACqk4XUcZmpqbGyiaY4L5cCSBfSB9AGoYEGhAMGuQ/QAYEogaKCF4BQpQKBnkKAJ9ASxni2ZmZPaqcEEIPe7L7yk4XXGBQGBwCTtfBQiAbgqEAmqCgHkKAJ9ASxniwDni2ZkkWRlgIl6AHoAZYBkkHyAODpkZYFlA+X/5Og7wAxkZYKsZ4soAn0BCeW1iWZmZLj9gEBwDY3NwH6APpA+ChUEgZwVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQBscF8uBKoQNFRchQBPoCWM8WzMzJ7VQB+kAwINcLAcMAkVvjDQgBpoIQLHa5c1JwuuMCNTc3I8ADjhozUDXHBfLgSQP6QDBZyFAE+gJYzxbMzMntVOA1AsAEjhhRJMcF8uBJ1DBDAMhQBPoCWM8WzMzJ7VTgXwWED/LwCQA+ghDVMnbbcIAQyMsFUAPPFiL6AhLLassfyz/JgEL7AAH+Nl8DggiYloAVoBW88uBLAvpA0wAwlcghzxbJkW3ighDRc1QAcIAYyMsFUAXPFiT6AhTLahPLHxTLPyP6RDBwuo4z+ChEA3BUIBNUFAPIUAT6AljPFgHPFszJIsjLARL0APQAywDJ+QBwdMjLAsoHy//J0M8WlmwicAHLAeL0AAoACsmAQPsAAH2tvPaiaH0AfSBqahg2GPwUALgqEAmqCgHkKAJ9ASxniwDni2ZkkWRlgIl6AHoAZYBk/IA4OmRlgWUD5f/k6EAAH68W9qJofQB9IGpqGD+qkEA=')
    static readonly jettonWalletCode = Cell.fromBase64('te6ccgECEQEAAyMAART/APSkE/S88sgLAQIBYgIDAgLMBAUAG6D2BdqJofQB9IH0gahhAgHUBgcCASAICQDDCDHAJJfBOAB0NMDAXGwlRNfA/AM4PpA+kAx+gAxcdch+gAx+gAwc6m0AALTH4IQD4p+pVIgupUxNFnwCeCCEBeNRRlSILqWMUREA/AK4DWCEFlfB7y6k1nwC+BfBIQP8vCAAET6RDBwuvLhTYAIBIAoLAIPUAQa5D2omh9AH0gfSBqGAJpj8EIC8aijKkQXUEIPe7L7wndCVj5cWLpn5j9ABgJ0CgR5CgCfQEsZ4sA54tmZPaqQB8VA9M/+gD6QCHwAe1E0PoA+kD6QNQwUTahUirHBfLiwSjC//LiwlQ0QnBUIBNUFAPIUAT6AljPFgHPFszJIsjLARL0APQAywDJIPkAcHTIywLKB8v/ydAE+kD0BDH6ACDXScIA8uLEd4AYyMsFUAjPFnD6AhfLaxPMgMAgEgDQ4AnoIQF41FGcjLHxnLP1AH+gIizxZQBs8WJfoCUAPPFslQBcwjkXKRceJQCKgToIIJycOAoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQC9ztRND6APpA+kDUMAjTP/oAUVGgBfpA+kBTW8cFVHNtcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMn5AHB0yMsCygfL/8nQUA3HBRyx8uLDCvoAUaihggiYloBmtgihggiYloCgGKEnlxBJEDg3XwTjDSXXCwGAPEADXO1E0PoA+kD6QNQwB9M/+gD6QDBRUaFSSccF8uLBJ8L/8uLCBYIJMS0AoBa88uLDghB73ZfeyMsfFcs/UAP6AiLPFgHPFslxgBjIywUkzxZw+gLLaszJgED7AEATyFAE+gJYzxYBzxbMye1UgAHBSeaAYoYIQc2LQnMjLH1Iwyz9Y+gJQB88WUAfPFslxgBDIywUkzxZQBvoCFctqFMzJcfsAECQQIwB8wwAjwgCwjiGCENUydttwgBDIywVQCM8WUAT6AhbLahLLHxLLP8ly+wCTNWwh4gPIUAT6AljPFgHPFszJ7VQ=')

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new PoolMinter(address);
    }

    static createFromConfig(ownerAddress: Address, mintFee: bigint, code: Cell, workchain = 0) {
        const data = preprarePoolMinterData(ownerAddress, mintFee, Pool.code, PoolMinter.minterCode, PoolMinter.jettonWalletCode);
        const init = { code, data };
        return new PoolMinter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0, 32 + 64).endCell(),
        });
    }

    async sendMint(provider: ContractProvider, via: Sender, value: bigint, contentUrl: string, queryId = 0) {
        const contentCell = beginCell().storeUint(1, 8).storeStringTail(contentUrl).endCell();

        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().
                storeUint(0x318f361, 32).
                storeUint(queryId, 64).
                storeRef(contentCell).
                endCell()
        });
    }

    async sendWithdrawalRequest(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        amount: bigint,) {
        const msg_body = beginCell()
            .storeUint(0xde714f65, 32)  // OP Code
            .storeUint(0, 64)
            .storeCoins(amount)
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        })
    }

     async getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address> {
        const messageSlice = beginCell().storeAddress(owner).endCell();

        const res = await provider.get('get_wallet_address', [{ type: 'slice', cell: messageSlice }])
        return res.stack.readAddress()
    }

    async getAddresses(provider: ContractProvider, contentUrl: string): Promise<addressesData> {
        const contentCell = beginCell().storeUint(1, 8).storeStringTail(contentUrl).endCell();
        const res = await provider.get('get_addresses', [{ type: 'cell', cell: contentCell }])

        return { minterAddress: res.stack.readAddress(), poolAddress: res.stack.readAddress() };
    }

    async getData(provider: ContractProvider) {
        const { stack } = await provider.get("get_contract_storage_data", []);
        return {
          owner_address: stack.readAddress(),
        };
      }
      
    async getBalance(provider: ContractProvider) {
        const { stack } = await provider.get("balance", []);
        return {
          number: stack.readNumber(),
        };
    }
}
