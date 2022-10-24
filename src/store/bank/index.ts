import { fromBaseToDisplay, toMicroUnit, toViewDenom } from "@/utils"
import { acceptHMRUpdate, defineStore } from "pinia"
import { bitsongClient } from "@/services"
import { QueryAllBalancesRequest } from "@bitsongjs/client/dist/codec/cosmos/bank/v1beta1/query"
import {
	btsgStakingCoin,
	btsgAssets,
	ibcBitsongOsmosis,
	bitsongStdFee,
} from "@/configs"
import { compact } from "lodash"
import useAuth from "@/store/auth"
import { lastValueFrom } from "rxjs"
import { Coin } from "@cosmjs/proto-signing"
import { MsgTransfer } from "@bitsongjs/client/dist/codec/ibc/applications/transfer/v1/tx"
import { MessageTimestamp } from "@/models"
import Long from "long"
import { DeliverTxResponse } from "@cosmjs/stargate"

export interface BankState {
	loading: boolean
	transfering: boolean
	balancesRaw: Coin[]
}

const useBank = defineStore("bank", {
	state: (): BankState => ({
		loading: false,
		transfering: false,
		balancesRaw: [],
	}),
	actions: {
		async sendIbcTokensToOsmosis(transferAmount: Coin) {
			try {
				const authStore = useAuth()

				if (
					ibcBitsongOsmosis &&
					authStore.osmosisAddress &&
					authStore.bitsongAddress
				) {
					this.transfering = true
					const txClient = await lastValueFrom(bitsongClient.txClient)

					const timeoutTimestamp = Math.floor(new Date().getTime() / 1000) + 600

					const timeoutTimestampNanoseconds = timeoutTimestamp
						? Long.fromNumber(timeoutTimestamp).multiply(1_000_000_000)
						: undefined

					const msg = MsgTransfer.fromJSON({
						sourcePort: ibcBitsongOsmosis.chain_1.port_id,
						sourceChannel: ibcBitsongOsmosis.chain_1.channel_id,
						sender: authStore.bitsongAddress,
						receiver: authStore.osmosisAddress,
						token: {
							denom: transferAmount.denom,
							amount: transferAmount.amount,
						},
						timeoutTimestamp:
							timeoutTimestampNanoseconds ?? (Long.fromString("0") as any),
					})

					// @ts-ignore
					delete msg.token?.$type

					if (txClient) {
						const signedTxBytes = await txClient.sign(
							authStore.bitsongAddress,
							[msg],
							bitsongStdFee,
							""
						)

						let txRes: DeliverTxResponse | undefined

						if (signedTxBytes) {
							txRes = await txClient.broadcast(signedTxBytes)
						}
					}
				}
			} catch (error) {
				console.error(error)
			} finally {
				this.transfering = false
			}
		},
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

					this.balancesRaw = balancesResponse.balances
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
		balancesDisplay: ({ balancesRaw }) => {
			const stakingCoin = btsgStakingCoin
			const assets = btsgAssets

			return stakingCoin && assets
				? compact(
						balancesRaw.map((balance) => {
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
		balances({ balancesRaw }) {
			const assetsList = btsgAssets

			if (assetsList) {
				const balancesCompact = compact(
					balancesRaw.map((balance) => toViewDenom(balance, assetsList.assets))
				)

				return balancesCompact.filter(
					(el) => !el.denom.startsWith("gamm/pool") && !el.denom.startsWith("ibc")
				)
			}

			return []
		},
		balance: ({ balancesRaw }) => {
			return (denom: string) => {
				const balance = balancesRaw.find((el) => el.denom === denom)

				if (balance) {
					return {
						denom: balance.denom,
						amount: toMicroUnit(balance.amount, -6),
					}
				}
			}
		},
		balanceDisplay: function () {
			return (denom: string) => {
				const balance = this.balances.find((el) => el.denom === denom)

				return balance
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
