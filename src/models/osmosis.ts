import { Coin } from "@cosmjs/proto-signing"

export enum GaugeDuration {
	"1D" = "1D",
	"7D" = "7D",
	"14D" = "14D",
}

export interface CreateGauge {
	isPerpetual: boolean
	denom: string
	duration: GaugeDuration
	coin?: Coin
	amount: string
	startTime: string
	numEpochsPaidOver: number
}
