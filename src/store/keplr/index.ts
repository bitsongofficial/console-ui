import { acceptHMRUpdate, defineStore } from "pinia"
import { AccountData } from "@cosmjs/proto-signing"
import { tokenToExperimentalSuggestChain } from "@/common"
import { AppCurrency } from "@keplr-wallet/types"
import { bitsongChain, bitsongRpcAddresses, btsgStakingCoin } from "@/configs"
import { bitsongClient } from "@/services"

export interface KeplrState {
	accounts: AccountData[]
	initialized: boolean
	error?: Error
	loading: boolean
}

const useKeplr = defineStore("keplr", {
	state: (): KeplrState => ({
		accounts: [],
		initialized: false,
		loading: false,
	}),
	actions: {
		async init() {
			try {
				this.loading = true

				if (window.keplr && bitsongChain && btsgStakingCoin) {
					const chainIds = [bitsongChain.chain_id]

					const experimentalChain = tokenToExperimentalSuggestChain(
						bitsongChain,
						btsgStakingCoin
					)

					if (experimentalChain) {
						await window.keplr.experimentalSuggestChain(experimentalChain)
					}

					await window.keplr.enable(chainIds)

					const accounts: AccountData[] = []

					const offlineSigner = await window.keplr.getOfflineSignerAuto(
						bitsongChain.chain_id
					)

					const aminoOfflineSigner = await window.keplr.getOfflineSignerOnlyAmino(
						bitsongChain.chain_id
					)

					await bitsongClient.connectSigner({
						type: "tendermint",
						endpoints: bitsongRpcAddresses,
						signer: aminoOfflineSigner,
					})

					const tokenAccounts = [...(await offlineSigner.getAccounts())]

					accounts.push(...tokenAccounts)

					this.accounts = [...accounts]
					this.initialized = true
				}
			} catch (error) {
				console.error(error)
				this.error = error as Error
				throw error
			} finally {
				this.loading = false
			}
		},
		async getAddress(chainId: string) {
			if (window.keplr) {
				await window.keplr.enable(chainId)

				const offlineSigner = await window.keplr.getOfflineSignerAuto(chainId)
				const accounts = [...(await offlineSigner.getAccounts())]

				return accounts.shift()
			}
		},
	},
	getters: {
		addresses: ({ accounts }) => accounts.map((account) => account.address),
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useKeplr, import.meta.hot))
}

export default useKeplr
