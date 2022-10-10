import { Chain } from "@chain-registry/types"

export const bitsongTestnetChain: Chain = {
	chain_name: "bitsong",
	status: "live",
	network_type: "testnet",
	website: "https://bitsong.io/",
	pretty_name: "BitSong NFT Testnet",
	chain_id: "bitsong-localnet",
	bech32_prefix: "bitsong",
	slip44: 639,
	daemon_name: "bitsongd",
	apis: {
		rpc: [
			{
				address: "http://localhost:26657",
				provider: "selfhost",
			},
		],
		rest: [
			{
				address: "http://localhost:1317",
				provider: "selfhost",
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
