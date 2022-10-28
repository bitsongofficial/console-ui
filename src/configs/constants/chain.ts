import { MicroDenom } from "@bitsongjs/client"
import { AssetList } from "@chain-registry/types"
import { StdFee } from "@cosmjs/stargate/build"
import { chains, assets } from "chain-registry"
import { bitsongTestnetChain, osmosisTestnetChain } from "./testnet"

const testnet = import.meta.env.VITE_MODE === "testnet"

export const bitsongChain = testnet
	? bitsongTestnetChain
	: chains.find(({ chain_name }) => chain_name === "bitsong")

export const osmosisChain = testnet
	? osmosisTestnetChain
	: chains.find(({ chain_name }) => chain_name === "osmosis")

const defaultOsmosisRpcAddress = "https://rpc.osmo-test.bitsong.network"

export const osmosisRpcAddress = (function () {
	if (osmosisChain && osmosisChain.apis && osmosisChain.apis.rpc) {
		const rpc = osmosisChain.apis.rpc.map((grpc) => grpc.address).shift()

		if (rpc) {
			return rpc
		}
	}

	return defaultOsmosisRpcAddress
})()

export const osmosisAssets = assets.find(
	({ chain_name }) => chain_name === "osmosis"
)

export const bitsongRpcAddresses = (function () {
	if (bitsongChain && bitsongChain.apis && bitsongChain.apis.rpc) {
		return bitsongChain.apis.rpc.map((grpc) => grpc.address)
	}

	return ["https://rpc.explorebitsong.com"]
})()

export const bitsongLcdAddresses = (function () {
	if (bitsongChain && bitsongChain.apis && bitsongChain.apis.rest) {
		return bitsongChain.apis.rest.map((grpc) => grpc.address)
	}

	return ["https://lcd.explorebitsong.com"]
})()

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

export const osmosisStdFee: StdFee = {
	gas: "350000",
	amount: [
		{
			denom: "uosmo",
			amount: "10000",
		},
		{
			denom: "uosmo",
			amount: "25000",
		},
		{
			denom: "uosmo",
			amount: "40000",
		},
	],
}
