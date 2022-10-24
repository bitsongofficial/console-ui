import { lastValueFrom } from "rxjs"
import { bitsongClient } from "@/services"
import { acceptHMRUpdate, defineStore } from "pinia"
import useAuth from "../auth"

export interface ChainState {
	uploading: boolean
}

const useCosmWasm = defineStore("cosmWasm", {
	state: (): ChainState => ({
		uploading: false,
	}),
	actions: {
		async uploadContract(file: Uint8Array) {
			const authStore = useAuth()

			try {
				this.uploading = true

				if (authStore.bitsongAddress) {
					const txClient = await lastValueFrom(bitsongClient.txClient)

					const result = await txClient?.signingCosmWasmClient.upload(
						authStore.bitsongAddress,
						file,
						"auto"
					)

					if (!result) {
						throw new Error("Upload failed")
					}

					return result
				}
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.uploading = false
			}
		},
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCosmWasm, import.meta.hot))
}

export default useCosmWasm
