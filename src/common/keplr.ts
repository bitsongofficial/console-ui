import { AppCurrency, ChainInfo } from "@keplr-wallet/types"
import { Chain, Asset } from "@chain-registry/types"
import { tokenToKeplrCoin } from "./network"

export const tokenToExperimentalSuggestChain = (
	chain: Chain,
	asset: Asset
): ChainInfo | undefined => {
	const stakeCurrency = tokenToKeplrCoin(chain, asset.base)
	const currencies: AppCurrency[] = []
	const feeCurrencies: AppCurrency[] = []

	const rpcAddresses =
		chain && chain.apis && chain.apis.rpc
			? chain.apis.rpc.map((grpc) => grpc.address)
			: ["https://rpc.explorebitsong.com"]

	const lcdAddresses =
		chain && chain.apis && chain.apis.rest
			? chain.apis.rest.map((rest) => rest.address)
			: ["https://lcd.explorebitsong.com"]

	if (stakeCurrency) {
		currencies.push(stakeCurrency)
		feeCurrencies.push(stakeCurrency)

		return {
			chainId: chain.chain_id,
			chainName: chain.pretty_name,
			rpc: rpcAddresses[0],
			rest: lcdAddresses[0],
			stakeCurrency,
			bip44: {
				coinType: chain.slip44,
			},
			bech32Config: {
				bech32PrefixAccAddr: chain.bech32_prefix,
				bech32PrefixAccPub: chain.bech32_prefix + "pub",
				bech32PrefixValAddr: chain.bech32_prefix + "valoper",
				bech32PrefixValPub: chain.bech32_prefix + "valoperpub",
				bech32PrefixConsAddr: chain.bech32_prefix + "valcons",
				bech32PrefixConsPub: chain.bech32_prefix + "valconspub",
			},
			currencies,
			feeCurrencies,
			coinType: chain.slip44,
			features: ["ibc-transfer", "ibc-go"],
		}
	}
}
