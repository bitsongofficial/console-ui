import { BitsongClient } from "@bitsongjs/client"
import { bitsongRpcAddresses } from "@/configs"
import { QueryClientImpl as StakingQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/staking/v1beta1/query"
import { QueryClientImpl as BankQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/bank/v1beta1/query"
import { ServiceClientImpl as BaseQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/base/tendermint/v1beta1/query"
import { QueryClientImpl as MerkledropQueryClientImpl } from "@bitsongjs/client/dist/codec/bitsong/merkledrop/v1beta1/query"
import { QueryClientImpl as FantokenQueryClientImpl } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/query"
import { tap } from "rxjs"

const modules = {
	bank: BankQueryClientImpl,
	staking: StakingQueryClientImpl,
	base: BaseQueryClientImpl,
	merkledrop: MerkledropQueryClientImpl,
	fantoken: FantokenQueryClientImpl,
}

const bitsongClient = new BitsongClient<typeof modules>(
	{
		connection: {
			type: "tendermint",
			endpoints: bitsongRpcAddresses,
		},
	},
	modules
)

export { bitsongClient }
