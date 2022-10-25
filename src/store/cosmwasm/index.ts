import { lastValueFrom } from "rxjs"
import { bitsongClient } from "@/services"
import { acceptHMRUpdate, defineStore } from "pinia"
import { ExecuteContract, InstantiateContract } from "@/models"
import useAuth from "../auth"
import { Contract, ContractCodeHistoryEntry } from "@cosmjs/cosmwasm-stargate"

export interface ChainState {
	uploading: boolean
	instantiating: boolean
	executing: boolean
	loadingContract: boolean
	contract?: Contract
	contractHistory: ContractCodeHistoryEntry[]
}

const useCosmWasm = defineStore("cosmWasm", {
	state: (): ChainState => ({
		uploading: false,
		instantiating: false,
		executing: false,
		loadingContract: false,
		contract: undefined,
		contractHistory: []
	}),
	actions: {
		async getContract(address: string) {
			try {
				this.loadingContract = true

				const txClient = await lastValueFrom(bitsongClient.txClient)

				const result = await txClient?.signingCosmWasmClient.getContract(address)
				const resultHistory = await txClient?.signingCosmWasmClient.getContractCodeHistory(address)

				if (!result || !resultHistory) {
					throw new Error("getContract failed")
				}

				this.contract = result
				this.contractHistory = resultHistory as ContractCodeHistoryEntry[]
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.loadingContract = false
			}
		},
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
		async executeContract(payload: ExecuteContract, contractAddress: string) {
			const authStore = useAuth()

			try {
				this.executing = true

				if (authStore.bitsongAddress) {
					const txClient = await lastValueFrom(bitsongClient.txClient)

					const result = await txClient?.signingCosmWasmClient.execute(
						authStore.bitsongAddress,
						contractAddress,
						JSON.parse(payload.msg),
						"auto",
						"",
						payload.funds
					)

					if (!result) {
						throw new Error("Execute failed")
					}

					return result
				}
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.executing = false
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
