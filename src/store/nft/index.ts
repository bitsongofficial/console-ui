import { acceptHMRUpdate, defineStore } from "pinia"
import { bitsongClient } from "@/services"
import { lastValueFrom } from "rxjs"
import { QueryCollectionRequest } from "@bitsongjs/client/dist/codec/bitsong/nft/v1beta1/query"
import Long from "long"

export interface NFTState {
	loading: boolean
}

const useNFT = defineStore("nft", {
	state: (): NFTState => ({
		loading: false,
	}),
	actions: {
		async loadCollections() {
			try {
				this.loading = true

				const query = await lastValueFrom(bitsongClient.query)
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
	import.meta.hot.accept(acceptHMRUpdate(useNFT, import.meta.hot))
}

export default useNFT
