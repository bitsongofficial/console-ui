import { acceptHMRUpdate, defineStore } from "pinia"
import { bitsongClient } from "@/services"
import { CreateNFT } from "@/models"
import { lastValueFrom } from "rxjs"
import {
	MsgCreateCollection,
	MsgCreateNFT,
} from "@bitsongjs/client/dist/codec/bitsong/nft/v1beta1/tx"
import { bitsongStdFee } from "@/configs"
import { DeliverTxResponse, logs } from "@cosmjs/stargate"
import Long from "long"
import useAuth from "../auth"
import { QueryCollectionRequest } from "@bitsongjs/client/dist/codec/bitsong/nft/v1beta1/query"

export interface NFTState {
	loading: boolean
	creatingCollection: boolean
	creatingNFT: boolean
}

const useNFT = defineStore("nft", {
	state: (): NFTState => ({
		loading: false,
		creatingCollection: false,
		creatingNFT: false,
	}),
	actions: {
		async loadCollection(id: string) {
			try {
				this.loading = true

				const query = await lastValueFrom(bitsongClient.query)

				const response = await query.nft.Collection({
					$type: QueryCollectionRequest.$type,
					id: Long.fromString(id),
				})

				console.log(response)
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
		async createNFT(payload: CreateNFT) {
			try {
				if (bitsongClient) {
					const authStore = useAuth()
					this.creatingCollection = true

					const txClient = await lastValueFrom(bitsongClient.txClient)

					if (txClient && authStore.bitsongAddress) {
						const msg = MsgCreateNFT.fromPartial({
							sender: authStore.bitsongAddress,
							metadata: payload,
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

							const nftIdAttr = logs.findAttribute(
								parsedLogs,
								"bitsong.nft.v1beta1.EventNFTCreation",
								"nft_id"
							)

							return nftIdAttr.value.slice(1, -1)
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
