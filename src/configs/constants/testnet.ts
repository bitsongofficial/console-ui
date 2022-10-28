import { Chain } from "@chain-registry/types"

export const bitsongTestnetChain: Chain = {
	chain_name: "bitsong",
	status: "live",
	network_type: "testnet",
	website: "https://bitsong.io/",
	pretty_name: "BitSong CosmWasm Testnet",
	chain_id: "bwasmnet-1",
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

export const osmosisTestnetChain: Chain = {
	chain_name: "osmosis",
	status: "live",
	network_type: "testnet",
	website: "https://osmosis.zone/",
	pretty_name: "Osmosis Testnet",
	chain_id: "osmo-test-4",
	bech32_prefix: "osmo",
	slip44: 118,
	daemon_name: "osmosisd",
	apis: {
		rpc: [
			{
				address: "https://rpc-test.osmosis.zone",
				provider: "osmosis",
			},
		],
		rest: [
			{
				address: "https://lcd-test.osmosis.zone",
				provider: "osmosis",
			},
		],
		grpc: [
			{
				address: "https://grpc-test.osmosis.zone:443",
				provider: "osmosis",
			},
		],
	},
}
