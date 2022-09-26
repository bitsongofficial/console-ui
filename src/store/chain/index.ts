import { lastValueFrom } from "rxjs"
import { bitsongClient } from "@/services"
import { GetLatestBlockRequest } from "@bitsongjs/client/dist/codec/cosmos/base/tendermint/v1beta1/query"
import { acceptHMRUpdate, defineStore } from "pinia"
import { Block } from "@bitsongjs/client/dist/codec/tendermint/types/block"

export interface ChainState {
	loadingBlock: boolean
	latestBlock?: Block
}

const useChain = defineStore("chain", {
	state: (): ChainState => ({
		loadingBlock: false,
		latestBlock: undefined,
	}),
	actions: {
		async loadBlock() {
			try {
				this.loadingBlock = true

				const query = await lastValueFrom(bitsongClient.query)

				const response = await query.base.GetLatestBlock({
					$type: GetLatestBlockRequest.$type,
				})

				this.latestBlock = response.block
			} catch (error) {
				console.error(error)
			} finally {
				this.loadingBlock = false
			}
		},
	},
	getters: {
		latestHeight: ({ latestBlock }) =>
			latestBlock?.lastCommit?.height.toNumber() ?? 0,
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useChain, import.meta.hot))
}

export default useChain
