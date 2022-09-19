import { BitsongClient } from "@bitsongjs/client"
import { bitsongRpcAddresses } from "@/configs"
import { QueryClientImpl as StakingQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/staking/v1beta1/query"
import { QueryClientImpl as BankQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/bank/v1beta1/query"
import { ServiceClientImpl as BaseQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/base/tendermint/v1beta1/query"
import { QueryClientImpl as MerkledropQueryClientImpl } from "@bitsongjs/client/dist/codec/bitsong/merkledrop/v1beta1/query"
import { QueryClientImpl as FantokenQueryClientImpl } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/query"
import { OfflineSigner } from "@cosmjs/proto-signing"

let bitsongClient: BitsongClient
let stakingClient: StakingQueryClientImpl
let bankClient: BankQueryClientImpl
let baseClient: BaseQueryClientImpl
let merkledropClient: MerkledropQueryClientImpl
let fantokenClient: FantokenQueryClientImpl

const connectClient = (signer?: OfflineSigner) => {
	BitsongClient.connect({
		connection: {
			type: "tendermint",
			endpoints: bitsongRpcAddresses,
			signer,
		},
	}).then((client) => {
		bitsongClient = client

		stakingClient = new StakingQueryClientImpl(bitsongClient.queryClient)
		baseClient = new BaseQueryClientImpl(bitsongClient.queryClient)
		bankClient = new BankQueryClientImpl(bitsongClient.queryClient)
		merkledropClient = new MerkledropQueryClientImpl(bitsongClient.queryClient)
		fantokenClient = new FantokenQueryClientImpl(bitsongClient.queryClient)
	})
}

connectClient()

export {
	bitsongClient,
	stakingClient,
	baseClient,
	bankClient,
	merkledropClient,
	fantokenClient,
	connectClient,
}
