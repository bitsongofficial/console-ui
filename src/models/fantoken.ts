export interface IssueFantoken {
	name: string
	symbol: string
	uri: string
	maxSupply: number
	authority: string
	minter: string
}

export interface MintFantoken {
	amount: number
	recipient: string
}

export interface BurnFantoken {
	amount: number
}
