import { Asset } from "@chain-registry/types"
import { Coin } from "@cosmjs/proto-signing"

export interface MerkledropForm {
	startHeight: number
	endHeight: number
	accountsFile?: File
	coin: number // total amount of airdrop
	merkleRoot: string
	asset?: Asset
}

export interface MerkledropCreate {
	startHeight: number
	endHeight: number
	coin: Coin
	merkleRoot: string
	asset: Asset
}
