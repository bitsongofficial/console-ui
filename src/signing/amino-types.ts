import { lockQueryTypeFromJSON } from "@/utils"
import { AminoConverters } from "@cosmjs/stargate"
import Long from "long"
import { MsgCreateGauge } from "osmojs/types/codegen/osmosis/incentives/tx"

export interface AminoMsgCreateGauge {
	readonly type: "osmosis/lockup/lock-tokens"
	readonly value: {
		is_perpetual: boolean
		owner: string
		distribute_to: {
			lock_query_type: number
			denom: string
			duration: string
			timestamp: string
		}
		coins: {
			denom: string
			amount: string
		}[]
		start_time: string
		num_epochs_paid_over: string
	}
}

export const createOsmosisAminoConverters = (): AminoConverters => ({
	"/osmosis.incentives.MsgCreateGauge": {
		aminoType: "osmosis/incentives/create-gauge",
		toAmino: ({
			isPerpetual,
			owner,
			distributeTo,
			coins,
			startTime,
			numEpochsPaidOver,
		}: MsgCreateGauge) => {
			return {
				is_perpetual: isPerpetual,
				owner,
				distribute_to: {
					lock_query_type: distributeTo.lockQueryType,
					denom: distributeTo.denom,
					duration: (
						distributeTo.duration.seconds.toInt() * 1_000_000_000
					).toString(),
					timestamp: distributeTo.timestamp,
				},
				coins: coins.map((el0) => ({
					denom: el0.denom,
					amount: el0.amount,
				})),
				start_time: startTime,
				num_epochs_paid_over: numEpochsPaidOver.toString(),
			}
		},
		fromAmino: ({
			is_perpetual,
			owner,
			distribute_to,
			coins,
			start_time,
			num_epochs_paid_over,
		}: AminoMsgCreateGauge["value"]) => {
			console.log(start_time)
			return {
				isPerpetual: is_perpetual,
				owner,
				distributeTo: {
					lockQueryType: lockQueryTypeFromJSON(distribute_to.lock_query_type),
					denom: distribute_to.denom,
					duration: {
						seconds: Long.fromNumber(
							Math.floor(parseInt(distribute_to.duration) / 1_000_000_000)
						),
						nanos: parseInt(distribute_to.duration) % 1_000_000_000,
					},
					timestamp: new Date(distribute_to.timestamp),
				},
				coins: coins.map((el0) => ({
					denom: el0.denom,
					amount: el0.amount,
				})),
				startTime: new Date(start_time),
				numEpochsPaidOver: Long.fromString(num_epochs_paid_over),
			}
		},
	},
})
