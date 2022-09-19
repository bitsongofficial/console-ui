import { MicroDenom } from "@bitsongjs/client"
import { StdFee } from "@cosmjs/stargate/build"
import { chains, assets } from "chain-registry"

export const bitsongChain = chains.find(
	({ chain_name }) => chain_name === "bitsong"
)

export const bitsongRpcAddresses =
	bitsongChain && bitsongChain.apis
		? bitsongChain.apis.rpc.map((grpc) => grpc.address)
		: ["https://rpc.explorebitsong.com"]

export const bitsongLcdAddresses =
	bitsongChain && bitsongChain.apis
		? bitsongChain.apis.rest.map((rest) => rest.address)
		: ["https://lcd.explorebitsong.com"]

export const btsgAssets = assets.find(
	({ chain_name }) => chain_name === "bitsong"
)

export const btsgStakingCoin = btsgAssets?.assets.find(
	(asset) => asset.base === MicroDenom
)

export const bitsongStdFee: StdFee = {
	gas: "350000",
	amount: [
		{
			denom: MicroDenom,
			amount: "10000",
		},
		{
			denom: MicroDenom,
			amount: "25000",
		},
		{
			denom: MicroDenom,
			amount: "40000",
		},
	],
}
