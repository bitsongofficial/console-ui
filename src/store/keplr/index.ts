import { acceptHMRUpdate, defineStore } from "pinia"
import { AccountData } from "@cosmjs/proto-signing"
import { tokenToExperimentalSuggestChain } from "@/common"
import {
	bitsongChain,
	bitsongRpcAddresses,
	btsgStakingCoin,
	osmosisChain,
} from "@/configs"
import { bitsongClient, setOsmosisClient } from "@/services"

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

				if (window.keplr && bitsongChain && osmosisChain && btsgStakingCoin) {
					const chainIds = [bitsongChain.chain_id, osmosisChain.chain_id]

					const experimentalChain = tokenToExperimentalSuggestChain(
						bitsongChain,
						btsgStakingCoin
					)

					if (experimentalChain) {
						await window.keplr.experimentalSuggestChain(experimentalChain)
					}

					await window.keplr.enable(chainIds)

					const accounts: AccountData[] = []

					const aminoOfflineSigner = await window.keplr.getOfflineSignerOnlyAmino(
						bitsongChain.chain_id
					)

					const osmosisAminoOfflineSigner =
						await window.keplr.getOfflineSignerOnlyAmino(osmosisChain.chain_id)

					const bitsongAccounts = [...(await aminoOfflineSigner.getAccounts())]
					const osmosisAccounts = [
						...(await osmosisAminoOfflineSigner.getAccounts()),
					]

					await bitsongClient.connectSigner({
						type: "tendermint",
						endpoints: bitsongRpcAddresses,
						signer: aminoOfflineSigner,
					})

					const tokenAccounts = [...bitsongAccounts, ...osmosisAccounts]

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
