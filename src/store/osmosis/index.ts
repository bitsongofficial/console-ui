import { acceptHMRUpdate, defineStore } from "pinia"
import useAuth from "../auth"
import { Coin } from "@cosmjs/proto-signing"
import { toViewDenom } from "@/utils"
import { osmosisAssets, osmosisChain, osmosisRpcAddress } from "@/configs"
import { getSigningOsmosisClient, osmosis } from "osmojs"
import { compact } from "lodash"

const { createGauge } = osmosis.incentives.MessageComposer.withTypeUrl

export interface NFTState {
	loadingBalances: boolean
	balancesRaw: readonly Coin[]
}

const useOsmosis = defineStore("osmosis", {
	state: (): NFTState => ({
		loadingBalances: false,
		balancesRaw: [],
	}),
	actions: {
		async loadBalances() {
			const authStore = useAuth()

			try {
				this.loadingBalances = true

				if (window.keplr && osmosisChain) {
					const signer = await window.keplr.getOfflineSignerOnlyAmino(
						osmosisChain.chain_id
					)

					const osmosisClient = await getSigningOsmosisClient({
						rpcEndpoint: osmosisRpcAddress,
						signer, // OfflineSigner
					})

					if (authStore.osmosisAddress) {
						this.balancesRaw = await osmosisClient.getAllBalances(
							authStore.osmosisAddress
						)
					}
				}
			} catch (error) {
				console.error(error)
			} finally {
				this.loadingBalances = false
			}
		},
	},
	getters: {
		balances({ balancesRaw }) {
			if (osmosisAssets) {
				const balancesCompact = compact(
					balancesRaw.map((balance) => toViewDenom(balance, osmosisAssets.assets))
				)

				return balancesCompact.filter(
					(el) => !el.denom.startsWith("gamm/pool") && !el.denom.startsWith("ibc")
				)
			}

			return []
		},
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useOsmosis, import.meta.hot))
}

export default useOsmosis
