import { assets } from "chain-registry"
import { fromBaseToDisplay } from "@/utils"
import { Coin } from "@bitsongjs/client/dist/codec/cosmos/base/v1beta1/coin"
import { acceptHMRUpdate, defineStore } from "pinia"
import { bankClient } from "@/services"
import { QueryAllBalancesRequest } from "@bitsongjs/client/dist/codec/cosmos/bank/v1beta1/query"
import { btsgStakingCoin, btsgAssets } from "@/configs"
import useAuth from "@/store/auth"
import { compact } from "lodash"

export interface BankState {
	loading: boolean
	balances: Coin[]
}

const useBank = defineStore("bank", {
	state: (): BankState => ({
		loading: false,
		balances: [],
	}),
	actions: {
		async init() {
			try {
				this.loading = true

				this.loadBalance()
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.loading = false
			}
		},
		async loadBalance() {
			try {
				const authStore = useAuth()
				const bitsongAddress = authStore.bitsongAddress

				if (bitsongAddress) {
					const balancesResponse = await bankClient.AllBalances({
						$type: QueryAllBalancesRequest.$type,
						address: bitsongAddress,
					})

					this.balances = balancesResponse.balances
				}
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.loading = false
			}
		},
	},
	getters: {
		balancesDisplay: ({ balances }) => {
			const stakingCoin = btsgStakingCoin
			const assets = btsgAssets

			return stakingCoin && assets
				? compact(
						balances.map((balance) => {
							const asset = assets.assets.find((el) => el.base === balance.denom)

							return asset ? fromBaseToDisplay(balance, asset) : undefined
						})
				  )
				: []
		},
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useBank, import.meta.hot))
}

export default useBank
