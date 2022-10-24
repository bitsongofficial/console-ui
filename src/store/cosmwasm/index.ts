import { lastValueFrom } from "rxjs"
import { bitsongClient } from "@/services"
import { acceptHMRUpdate, defineStore } from "pinia"
import { InstantiateContract } from "@/models"
import useAuth from "../auth"

export interface ChainState {
	uploading: boolean
	instantiating: boolean
}

const useCosmWasm = defineStore("cosmWasm", {
	state: (): ChainState => ({
		uploading: false,
		instantiating: false,
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
		async instantiateCode(payload: InstantiateContract) {
			const authStore = useAuth()

			try {
				this.instantiating = true

				if (authStore.bitsongAddress) {
					const txClient = await lastValueFrom(bitsongClient.txClient)

					const result = await txClient?.signingCosmWasmClient.instantiate(
						authStore.bitsongAddress,
						payload.codeId,
						JSON.parse(payload.msg),
						payload.label,
						"auto",
						{
							admin: payload.admin,
							funds: payload.funds,
						}
					)

					if (!result) {
						throw new Error("Instantiate failed")
					}

					return result
				}
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.instantiating = false
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
