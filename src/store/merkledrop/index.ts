import { bitsongClient, merkledropClient } from "@/services"
import { acceptHMRUpdate, defineStore } from "pinia"
import { QueryParamsRequest } from "@bitsongjs/client/dist/codec/bitsong/merkledrop/v1beta1/query"
import { MsgCreate } from "@bitsongjs/client/dist/codec/bitsong/merkledrop/v1beta1/tx"
import { Params } from "@bitsongjs/client/dist/codec/bitsong/merkledrop/v1beta1/params"
import { fromBaseToDisplay } from "@/utils"
import { bitsongStdFee, btsgStakingCoin } from "@/configs"
import { MerkledropCreate } from "@/models"
import { DeliverTxResponse, logs } from "@cosmjs/stargate"
import useAuth from "@/store/auth"

export interface MerkledropState {
	loading: boolean
	loadingParams: boolean
	params?: Params
}

const useMerkledrop = defineStore("merkledrop", {
	state: (): MerkledropState => ({
		loading: false,
		loadingParams: false,
		params: undefined,
	}),
	actions: {
		async loadParams() {
			try {
				this.loadingParams = true

				const params = await merkledropClient.Params({
					$type: QueryParamsRequest.$type,
				})

				this.params = params.params
			} catch (error) {
				console.error(error)
			} finally {
				this.loadingParams = false
			}
		},
		async createMerkledrop(payload: MerkledropCreate) {
			const authStore = useAuth()

			if (bitsongClient && bitsongClient.txClient && authStore.bitsongAddress) {
				try {
					this.loading = true

					const msg = MsgCreate.fromPartial({
						owner: authStore.bitsongAddress,
						coin: payload.coin,
						merkleRoot: payload.merkleRoot,
						endHeight: payload.endHeight,
						startHeight: payload.startHeight,
					})

					const signedTxBytes = await bitsongClient.txClient.sign(
						authStore.bitsongAddress,
						[msg],
						bitsongStdFee,
						""
					)

					let txRes: DeliverTxResponse | undefined

					if (signedTxBytes) {
						txRes = await bitsongClient.txClient.broadcast(signedTxBytes)

						const parsedLogs = logs.parseLogs(logs.parseRawLog(txRes.rawLog))

						const merkledropIdAttr = logs.findAttribute(
							parsedLogs,
							"bitsong.merkledrop.v1beta1.EventCreate",
							"merkledrop_id"
						)

						return merkledropIdAttr.value.slice(1, -1)
					}
				} catch (error) {
					console.error(error)
					throw error
				} finally {
					this.loading = false
				}
			}
		},
	},
	getters: {
		creationFee: ({ params }) => {
			if (params && params.creationFee && btsgStakingCoin) {
				return fromBaseToDisplay(params.creationFee, btsgStakingCoin)
			}
		},
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMerkledrop, import.meta.hot))
}

export default useMerkledrop
