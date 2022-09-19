import { merkledropClient } from "@/services"
import { acceptHMRUpdate, defineStore } from "pinia"
import { QueryParamsRequest } from "@bitsongjs/client/dist/codec/bitsong/merkledrop/v1beta1/query"
import { Coin } from "@bitsongjs/client/dist/codec/cosmos/base/v1beta1/coin"
import { Params } from "@bitsongjs/client/dist/codec/bitsong/merkledrop/v1beta1/params"
import { fromBaseToDisplay } from "@/utils"
import { btsgStakingCoin } from "@/configs"

export interface MerkledropState {
	loading: boolean
	loadingParams: boolean
	params?: Params
}

const useMerkledrop = defineStore("merkledrop", {
	state: (): MerkledropState => ({
		loading: false,
		loadingParams: false,
		params: undefined,
	}),
	actions: {
		async loadParams() {
			try {
				this.loadingParams = true

				const params = await merkledropClient.Params({
					$type: QueryParamsRequest.$type,
				})

				this.params = params.params
			} catch (error) {
				console.error(error)
			} finally {
				this.loadingParams = false
			}
		},
	},
	getters: {
		creationFee: ({ params }) => {
			if (params && params.creationFee && btsgStakingCoin) {
				return fromBaseToDisplay(params.creationFee, btsgStakingCoin)
			}
		},
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMerkledrop, import.meta.hot))
}

export default useMerkledrop
