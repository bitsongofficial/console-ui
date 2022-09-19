import { BitsongClient } from "@bitsongjs/client"
import { bitsongRpcAddresses } from "@/configs"
import { QueryClientImpl as StakingQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/staking/v1beta1/query"
import { QueryClientImpl as BankQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/bank/v1beta1/query"
import { ServiceClientImpl as BaseQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/base/tendermint/v1beta1/query"
import { QueryClientImpl as MerkledropQueryClientImpl } from "@bitsongjs/client/dist/codec/bitsong/merkledrop/v1beta1/query"

let bitsongClient: BitsongClient
let stakingClient: StakingQueryClientImpl
let bankClient: BankQueryClientImpl
let baseClient: BaseQueryClientImpl
let merkledropClient: MerkledropQueryClientImpl

BitsongClient.connect({
	connection: {
		type: "tendermint",
		endpoints: bitsongRpcAddresses,
	},
}).then((client) => {
	bitsongClient = client

	stakingClient = new StakingQueryClientImpl(bitsongClient.queryClient)
	baseClient = new BaseQueryClientImpl(bitsongClient.queryClient)
	bankClient = new BankQueryClientImpl(bitsongClient.queryClient)
	merkledropClient = new MerkledropQueryClientImpl(bitsongClient.queryClient)
})

export {
	bitsongClient,
	stakingClient,
	baseClient,
	bankClient,
	merkledropClient,
}
