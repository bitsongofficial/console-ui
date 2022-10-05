import { acceptHMRUpdate, defineStore } from "pinia"
import useAuth from "../auth"
import { Coin, coins } from "@cosmjs/proto-signing"
import { toViewDenom } from "@/utils"
import {
	osmosisAssets,
	osmosisChain,
	osmosisRpcAddress,
	osmosisStdFee,
} from "@/configs"
import { getSigningOsmosisClient, osmosis } from "osmojs"
import { compact } from "lodash"
import { signAndBroadcast, toDuration } from "@osmonauts/helpers"
import { CreateGauge } from "@/models"
import { parse, toSeconds } from "duration-fns"
import Long from "long"
import { logs } from "@cosmjs/stargate"

const { createGauge } = osmosis.incentives.MessageComposer.withTypeUrl

export interface NFTState {
	loadingBalances: boolean
	creatingGauge: boolean
	balancesRaw: readonly Coin[]
}

const useOsmosis = defineStore("osmosis", {
	state: (): NFTState => ({
		loadingBalances: false,
		creatingGauge: false,
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
		async createNewGauge(data: CreateGauge) {
			const authStore = useAuth()

			try {
				this.creatingGauge = true

				if (window.keplr && osmosisChain && authStore.osmosisAddress && data.coin) {
					const signer = await window.keplr.getOfflineSignerOnlyAmino(
						osmosisChain.chain_id
					)

					const osmosisClient = await getSigningOsmosisClient({
						rpcEndpoint: osmosisRpcAddress,
						signer,
					})

					const duration = parse(`P${data.duration}`)

					const msg = createGauge({
						isPerpetual: data.isPerpetual,
						owner: authStore.osmosisAddress,
						coins: coins(data.amount, data.coin.denom),
						numEpochsPaidOver: Long.fromNumber(data.numEpochsPaidOver),
						startTime: new Date(data.startTime),
						distributeTo: {
							lockQueryType: 0,
							denom: `gamm/pool/${data.denom}`,
							duration: toDuration(toSeconds(duration).toString()),
							timestamp: new Date(),
						},
					})

					const res = await signAndBroadcast({
						client: osmosisClient,
						chainId: "osmosis-1",
						address: authStore.osmosisAddress,
						msgs: [msg],
						fee: osmosisStdFee,
						memo: "",
					})

					const parsedLogs = logs.parseLogs(logs.parseRawLog(res.rawLog))

					/* const denomAttr = logs.findAttribute(
            parsedLogs,
            'bitsong.fantoken.v1beta1.EventIssue',
            'denom',
          ); */

					console.log(parsedLogs, logs.parseRawLog(res.rawLog), res.rawLog)
				}
			} catch (error) {
				console.error(error)
			} finally {
				this.creatingGauge = false
			}
		},
	},
	getters: {
		balances({ balancesRaw }) {
			const assetsList = osmosisAssets

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
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useOsmosis, import.meta.hot))
}

export default useOsmosis
