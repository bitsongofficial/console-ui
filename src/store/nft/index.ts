import { acceptHMRUpdate, defineStore } from "pinia"
import { bitsongClient } from "@/services"
import { lastValueFrom } from "rxjs"
import { MsgCreateCollection } from "@bitsongjs/client/dist/codec/bitsong/nft/v1beta1/tx"
import useAuth from "../auth"
import { bitsongStdFee } from "@/configs"
import { DeliverTxResponse, logs } from "@cosmjs/stargate"

export interface NFTState {
	loading: boolean
	creatingCollection: boolean
}

const useNFT = defineStore("nft", {
	state: (): NFTState => ({
		loading: false,
		creatingCollection: false,
	}),
	actions: {
		async loadCollections() {
			try {
				this.loading = true

				const query = await lastValueFrom(bitsongClient.query)
			} catch (error) {
				console.error(error)
			} finally {
				this.loading = false
			}
		},
		async createCollection(payload: Partial<MsgCreateCollection>) {
			try {
				if (bitsongClient) {
					const authStore = useAuth()
					this.creatingCollection = true

					const txClient = await lastValueFrom(bitsongClient.txClient)

					if (txClient && authStore.bitsongAddress) {
						const msg = MsgCreateCollection.fromPartial({
							...payload,
							sender: authStore.bitsongAddress,
						})

						const signedTxBytes = await txClient.sign(
							authStore.bitsongAddress,
							[msg],
							bitsongStdFee,
							""
						)

						let txRes: DeliverTxResponse | undefined

						if (signedTxBytes) {
							txRes = await txClient.broadcast(signedTxBytes)

							const parsedLogs = logs.parseLogs(logs.parseRawLog(txRes.rawLog))

							const collectionIdAttr = logs.findAttribute(
								parsedLogs,
								"bitsong.nft.v1beta1.EventCollectionCreation",
								"collection_id"
							)

							return collectionIdAttr.value.slice(1, -1)
						}
					}
				}
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.creatingCollection = false
			}
		},
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useNFT, import.meta.hot))
}

export default useNFT
