import { Asset } from "@chain-registry/types"

export interface MerkledropForm {
	startHeight: number
	endHeight: number
	accountsFile?: File
	coin: number // total amount of airdrop
	merkleRoot: string
	asset?: Asset
}
