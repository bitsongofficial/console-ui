import { BitsongClient } from "@bitsongjs/client"
import { bitsongRpcAddresses } from "@/configs"
import { QueryClientImpl as StakingQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/staking/v1beta1/query"

let bitsongClient: BitsongClient
let stakingClient: StakingQueryClientImpl

BitsongClient.connect({
	connection: {
		type: "tendermint",
		endpoints: bitsongRpcAddresses,
	},
}).then((client) => {
	console.log(client)
	bitsongClient = client

	stakingClient = new StakingQueryClientImpl(bitsongClient.queryClient)
})

export { bitsongClient, stakingClient }
