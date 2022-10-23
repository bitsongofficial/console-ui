import { Chain } from "@chain-registry/types"

export const bitsongTestnetChain: Chain = {
	chain_name: "bitsong",
	status: "live",
	network_type: "testnet",
	website: "https://bitsong.io/",
	pretty_name: "BitSong CosmWasm Testnet",
	chain_id: "bitsong-cosmwasm-testnet",
	bech32_prefix: "bitsong",
	slip44: 639,
	daemon_name: "bitsongd",
	apis: {
		rpc: [
			{
				address: "https://rpc.bwasmnet-1.bitsong.network",
				provider: "bitsong",
			},
		],
		rest: [
			{
				address: "https://api.bwasmnet-1.bitsong.network",
				provider: "bitsong",
			},
		],
		grpc: [
			{
				address: "http://localhost:9090",
				provider: "selfhost",
			},
		],
	},
}
