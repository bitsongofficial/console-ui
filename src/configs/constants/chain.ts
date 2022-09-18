import { MicroDenom } from "@bitsongjs/client"
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
