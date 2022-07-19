import { BigNumber } from "@ethersproject/bignumber";
import { CurrencyAmount, Token } from "../../../sdk-core/src";
import { useTokenContract } from "../hooks/useContract";
import { useSingleCallResult } from "../state/multicall/hooks";

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useTotalSupply(token?: Token): CurrencyAmount | undefined {
    const contract = useTokenContract(token?.address, false);

    const totalSupply: BigNumber = useSingleCallResult(contract, "totalSupply")?.result?.[0];

    return token && totalSupply ? new CurrencyAmount(token, totalSupply.toString()) : undefined;
}
