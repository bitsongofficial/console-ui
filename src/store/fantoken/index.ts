import { bitsongClient, fantokenClient } from "@/services"
import { FanToken } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/fantoken"
import {
	QueryFanTokensRequest,
	QueryParamsRequest,
} from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/query"
import { Params } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/params"
import { MsgIssue } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/tx"
import {
	PageRequest,
	PageResponse,
} from "@bitsongjs/client/dist/codec/cosmos/base/query/v1beta1/pagination"
import Long from "long"
import { acceptHMRUpdate, defineStore } from "pinia"
import { bitsongStdFee, btsgStakingCoin } from "@/configs"
import { fromBaseToDisplay, toMicroUnit } from "@/utils"
import { IssueFantoken } from "@/models"
import useAuth from "../auth"
import { DeliverTxResponse, logs } from "@cosmjs/stargate"

export interface FantokenState {
	loading: boolean
	loadingParams: boolean
	fantokens: FanToken[]
	fantokensPagination?: PageResponse
	params?: Params
}

const useFantoken = defineStore("fantoken", {
	state: (): FantokenState => ({
		loading: false,
		loadingParams: false,
		fantokens: [],
		fantokensPagination: undefined,
		params: undefined,
	}),
	actions: {
		async loadParams() {
			try {
				this.loadingParams = true

				const params = await fantokenClient.Params({
					$type: QueryParamsRequest.$type,
				})

				this.params = params.params
			} catch (error) {
				console.error(error)
			} finally {
				this.loadingParams = false
			}
		},
		async loadFantokens(
			authority: string = "",
			limit = 9999,
			nextKey = new Uint8Array([])
		) {
			try {
				this.loading = true

				const response = await fantokenClient.FanTokens({
					$type: QueryFanTokensRequest.$type,
					authority,
					pagination: {
						$type: PageRequest.$type,
						key: nextKey,
						limit: Long.fromNumber(limit),
						countTotal: true,
						reverse: false,
						offset: Long.fromNumber(0),
					},
				})

				this.fantokens = response.fantokens
				this.fantokensPagination = response.pagination
			} catch (error) {
				console.error(error)
			} finally {
				this.loading = false
			}
		},
		async issueFantoken(payload: IssueFantoken) {
			const authStore = useAuth()

			if (bitsongClient && bitsongClient.txClient && authStore.bitsongAddress) {
				try {
					this.loading = true

					const msg = MsgIssue.fromPartial({
						name: payload.name,
						symbol: payload.symbol,
						uri: payload.uri,
						maxSupply: toMicroUnit(payload.maxSupply),
						authority: payload.authority,
						minter: payload.minter,
					})

					const signedTxBytes = await bitsongClient.txClient.sign(
						authStore.bitsongAddress,
						[msg],
						bitsongStdFee,
						""
					)

					let txRes: DeliverTxResponse | undefined

					if (signedTxBytes) {
						txRes = await bitsongClient.txClient.broadcast(signedTxBytes)

						const parsedLogs = logs.parseLogs(logs.parseRawLog(txRes.rawLog))

						const denomAttr = logs.findAttribute(
							parsedLogs,
							"bitsong.fantoken.v1beta1.EventIssue",
							"denom"
						)

						return denomAttr.value.slice(1, -1)
					}
				} catch (error) {
					console.error(error)
					throw error
				} finally {
					this.loading = false
				}
			}
		},
	},
	getters: {
		issueFee: ({ params }) => {
			if (params && params.issueFee && btsgStakingCoin) {
				return fromBaseToDisplay(params.issueFee, btsgStakingCoin)
			}
		},
		mintFee: ({ params }) => {
			if (params && params.mintFee && btsgStakingCoin) {
				return fromBaseToDisplay(params.mintFee, btsgStakingCoin)
			}
		},
		burnFee: ({ params }) => {
			if (params && params.burnFee && btsgStakingCoin) {
				return fromBaseToDisplay(params.burnFee, btsgStakingCoin)
			}
		},
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useFantoken, import.meta.hot))
}

export default useFantoken
