import { fantokenClient } from "@/services"
import { FanToken } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/fantoken"
import { QueryFanTokensRequest } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/query"
import {
	PageRequest,
	PageResponse,
} from "@bitsongjs/client/dist/codec/cosmos/base/query/v1beta1/pagination"
import Long from "long"
import { acceptHMRUpdate, defineStore } from "pinia"

export interface FantokenState {
	loading: boolean
	fantokens: FanToken[]
	fantokensPagination?: PageResponse
}

const useFantoken = defineStore("fantoken", {
	state: (): FantokenState => ({
		loading: false,
		fantokens: [],
		fantokensPagination: undefined,
	}),
	actions: {
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
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useFantoken, import.meta.hot))
}

export default useFantoken
