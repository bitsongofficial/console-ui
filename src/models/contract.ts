import { Coin } from "@cosmjs/proto-signing"

export interface ExecuteContract {
	msg: string
	funds: Coin[]
}

export interface InstantiateContract extends ExecuteContract {
	codeId: number
	label: string
	admin: string
}
