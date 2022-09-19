import { Chain } from "@chain-registry/types"
import { assets } from "chain-registry"
import { AppCurrency } from "@keplr-wallet/types"

export const tokenToKeplrCoin = (
	network: Chain,
	denom: string
): AppCurrency | undefined => {
	const assetList = assets.find(
		(asset) => asset.chain_name === network.chain_name
	)

	if (assetList) {
		const coinLookup = assetList.assets.find(
			(asset) => asset.base === denom || asset.symbol === denom
		)

		if (coinLookup) {
			const denomUnit = coinLookup.denom_units.find(
				(unit) => unit.denom === denom || unit.denom === denom
			)

			if (denomUnit) {
				return {
					// Coin denomination to be displayed to the user.
					coinDenom: coinLookup.display,
					// Actual denom (i.e. uatom, uscrt) used by the blockchain.
					coinMinimalDenom: denomUnit.denom,
					// # of decimal points to convert minimal denomination to user-facing denomination.
					coinDecimals: denomUnit.exponent,
					// (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
					// You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
					coinGeckoId: coinLookup.coingecko_id,
				}
			}
		}
	}
}
