import { Coin } from "@cosmjs/proto-signing"

export interface InstantiateContract {
	codeId: number
	msg: string
	label: string
	funds: Coin[]
	admin: string
}
