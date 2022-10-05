import { BitsongClient } from "@bitsongjs/client"
import { getSigningOsmosisClient } from "osmojs"
import { bitsongRpcAddresses, osmosisRpcAddress } from "@/configs"
import { QueryClientImpl as StakingQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/staking/v1beta1/query"
import { QueryClientImpl as BankQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/bank/v1beta1/query"
import { ServiceClientImpl as BaseQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/base/tendermint/v1beta1/query"
import { QueryClientImpl as MerkledropQueryClientImpl } from "@bitsongjs/client/dist/codec/bitsong/merkledrop/v1beta1/query"
import { QueryClientImpl as FantokenQueryClientImpl } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/query"
import { QueryClientImpl as NFTQueryClientImpl } from "@bitsongjs/client/dist/codec/bitsong/nft/v1beta1/query"
import { SigningStargateClient } from "@cosmjs/stargate"
import { OfflineSigner } from "@cosmjs/proto-signing"

const modules = {
	bank: BankQueryClientImpl,
	staking: StakingQueryClientImpl,
	base: BaseQueryClientImpl,
	merkledrop: MerkledropQueryClientImpl,
	fantoken: FantokenQueryClientImpl,
	nft: NFTQueryClientImpl,
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

let osmosisClient: SigningStargateClient | undefined = undefined

const setOsmosisClient = async (signer: OfflineSigner) => {
	osmosisClient = await getSigningOsmosisClient({
		rpcEndpoint: osmosisRpcAddress,
		signer, // OfflineSigner
	})
}

export { bitsongClient, osmosisClient, setOsmosisClient }
