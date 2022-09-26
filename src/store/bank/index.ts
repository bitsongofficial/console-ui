import { fromBaseToDisplay, toMicroUnit } from "@/utils"
import { Coin } from "@bitsongjs/client/dist/codec/cosmos/base/v1beta1/coin"
import { acceptHMRUpdate, defineStore } from "pinia"
import { bitsongClient } from "@/services"
import { QueryAllBalancesRequest } from "@bitsongjs/client/dist/codec/cosmos/bank/v1beta1/query"
import { btsgStakingCoin, btsgAssets } from "@/configs"
import { compact } from "lodash"
import useAuth from "@/store/auth"
import { lastValueFrom } from "rxjs"

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
					const query = await lastValueFrom(bitsongClient.query)

					const balancesResponse = await query.bank.AllBalances({
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

							if (asset) {
								return fromBaseToDisplay(balance, asset)
							}

							if (btsgStakingCoin) {
								return {
									denom: balance.denom,
									amount: toMicroUnit(balance.amount, -6),
								}
							}

							return undefined
						})
				  )
				: []
		},
		balance: ({ balances }) => {
			return (denom: string) => {
				const balance = balances.find((el) => el.denom === denom)

				if (balance) {
					return {
						denom: balance.denom,
						amount: toMicroUnit(balance.amount, -6),
					}
				}
			}
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
