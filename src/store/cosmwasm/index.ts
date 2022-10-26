import { lastValueFrom } from "rxjs"
import { bitsongClient } from "@/services"
import { acceptHMRUpdate, defineStore } from "pinia"
import { ExecuteContract, InstantiateContract } from "@/models"
import useAuth from "../auth"
import {
	Contract,
	Code,
	ContractCodeHistoryEntry,
} from "@cosmjs/cosmwasm-stargate"

export interface ChainState {
	uploading: boolean
	instantiating: boolean
	executing: boolean
	querying: boolean
	loadingContract: boolean
	loadingContracts: boolean
	loadingCodes: boolean
	contract?: Contract
	contractHistory: ContractCodeHistoryEntry[]
	contractsAddresses: Map<number, string[]>
	codes: Code[]
	codeId: number
}

const useCosmWasm = defineStore("cosmWasm", {
	state: (): ChainState => ({
		uploading: false,
		instantiating: false,
		executing: false,
		querying: false,
		loadingContract: false,
		loadingContracts: false,
		loadingCodes: false,
		contract: undefined,
		contractHistory: [],
		contractsAddresses: new Map(),
		codes: [],
		codeId: -1,
	}),
	actions: {
		async getContracts(codeId: number) {
			try {
				this.codeId = codeId
				this.loadingContracts = true

				const cosmWasmQueryClient = await lastValueFrom(
					bitsongClient.cosmWasmQueryClient
				)

				const result = await cosmWasmQueryClient.getContracts(codeId)

				if (!result) {
					throw new Error("getContracts failed")
				}

				this.contractsAddresses.set(codeId, result as string[])

				return result
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.loadingContracts = false
			}
		},
		async getCodes() {
			try {
				this.loadingCodes = true

				const cosmWasmQueryClient = await lastValueFrom(
					bitsongClient.cosmWasmQueryClient
				)

				const result = await cosmWasmQueryClient.getCodes()

				if (!result) {
					throw new Error("getCodes failed")
				}

				this.codes = result as Code[]

				return result
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.loadingCodes = false
			}
		},
		async queryContractSmart(address: string, queryMsg: string) {
			try {
				this.querying = true

				const cosmWasmQueryClient = await lastValueFrom(
					bitsongClient.cosmWasmQueryClient
				)

				const result = await cosmWasmQueryClient.queryContractSmart(
					address,
					JSON.parse(queryMsg)
				)

				if (!result) {
					throw new Error("queryContractSmart failed")
				}

				return result
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.querying = false
			}
		},
		async getContract(address: string) {
			try {
				this.loadingContract = true

				const cosmWasmQueryClient = await lastValueFrom(
					bitsongClient.cosmWasmQueryClient
				)

				const result = await cosmWasmQueryClient.getContract(address)
				const resultHistory = await cosmWasmQueryClient.getContractCodeHistory(
					address
				)

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
	getters: {
		getCodesByCreator({ codes }) {
			return (creator: string) => codes.filter((code) => code.creator === creator)
		},
		getAddressesByCode: ({ contractsAddresses }) => {
			return (code: number) => {
				const addresses = contractsAddresses.get(code) ?? []

				return addresses.map((address) => ({
					address,
				}))
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
