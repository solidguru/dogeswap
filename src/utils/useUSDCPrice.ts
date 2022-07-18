import JSBI from "jsbi";
import { useMemo } from "react";
import { ChainId } from "../../../sdk-core/src/constants";
import { Currency } from "../../../sdk-core/src/entities/currency";
import Price from "../../../sdk-core/src/entities/fractions/price";
import { currencyEquals } from "../../../sdk-core/src/utils";
import { USDC } from "../constants";
import { WDC } from "../constants/currencies";
import { PairState, usePairs } from "../data/Reserves";
import { useActiveWeb3React } from "../hooks";
import { wrappedCurrency } from "./wrappedCurrency";

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(currency?: Currency): Price | undefined {
    const { chainId } = useActiveWeb3React();
    const wrapped = wrappedCurrency(currency, chainId);
    const tokenPairs: [Currency | undefined, Currency | undefined][] = useMemo(
        () => [
            [
                chainId && wrapped && currencyEquals(WDC[chainId], wrapped) ? undefined : currency,
                chainId ? WDC[chainId] : undefined,
            ],
            [wrapped?.equals(USDC) ? undefined : wrapped, chainId === ChainId.MAINNET ? USDC : undefined],
            [chainId ? WDC[chainId] : undefined, chainId === ChainId.MAINNET ? USDC : undefined],
        ],
        [chainId, currency, wrapped],
    );
    const [[ethPairState, ethPair], [usdcPairState, usdcPair], [usdcEthPairState, usdcEthPair]] = usePairs(tokenPairs);

    return useMemo(() => {
        if (!currency || !wrapped || !chainId) {
            return undefined;
        }
        // handle wdc/eth
        if (wrapped.equals(WDC[chainId])) {
            if (usdcPair) {
                const price = usdcPair.priceOf(WDC[chainId]);
                return new Price(currency, USDC, price.denominator, price.numerator);
            } else {
                return undefined;
            }
        }
        // handle usdc
        if (wrapped.equals(USDC)) {
            return new Price(USDC, USDC, "1", "1");
        }

        const ethPairETHAmount = ethPair?.reserveOf(WDC[chainId]);
        const ethPairETHUSDCValue: JSBI =
            ethPairETHAmount && usdcEthPair
                ? usdcEthPair.priceOf(WDC[chainId]).quote(ethPairETHAmount).raw
                : JSBI.BigInt(0);

        // all other tokens
        // first try the usdc pair
        if (
            usdcPairState === PairState.EXISTS &&
            usdcPair &&
            usdcPair.reserveOf(USDC).greaterThan(ethPairETHUSDCValue)
        ) {
            const price = usdcPair.priceOf(wrapped);
            return new Price(currency, USDC, price.denominator, price.numerator);
        }
        if (ethPairState === PairState.EXISTS && ethPair && usdcEthPairState === PairState.EXISTS && usdcEthPair) {
            if (usdcEthPair.reserveOf(USDC).greaterThan("0") && ethPair.reserveOf(WDC[chainId]).greaterThan("0")) {
                const ethUsdcPrice = usdcEthPair.priceOf(USDC);
                const currencyEthPrice = ethPair.priceOf(WDC[chainId]);
                const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert();
                return new Price(currency, USDC, usdcPrice.denominator, usdcPrice.numerator);
            }
        }
        return undefined;
    }, [chainId, currency, ethPair, ethPairState, usdcEthPair, usdcEthPairState, usdcPair, usdcPairState, wrapped]);
}
