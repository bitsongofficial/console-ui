import { acceptHMRUpdate, defineStore } from "pinia"
import useAuth from "../auth"
import { Coin, coins, Registry } from "@cosmjs/proto-signing"
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
import {
	AminoTypes,
	defaultRegistryTypes,
	logs,
	SigningStargateClient,
} from "@cosmjs/stargate"
import { createOsmosisAminoConverters } from "@/signing"

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
					const signer = await window.keplr.getOfflineSigner(osmosisChain.chain_id)

					const registry = new Registry(defaultRegistryTypes)

					const aminoTypes = new AminoTypes({
						...osmosis.gamm.v1beta1.AminoConverter,
						...osmosis.lockup.AminoConverter,
						...osmosis.incentives.AminoConverter,
						...createOsmosisAminoConverters(),
					})

					osmosis.gamm.v1beta1.load(registry)
					osmosis.lockup.load(registry)
					osmosis.incentives.load(registry)

					const client = await SigningStargateClient.connectWithSigner(
						osmosisRpcAddress,
						signer,
						{ registry, aminoTypes }
					)

					const duration = parse(`P${data.duration}`)
					const msgDuration = toSeconds(duration) * 1_000_000_000

					const durationObj = {
						seconds: Long.fromNumber(Math.floor(msgDuration / 1_000_000_000)),
						nanos: msgDuration % 1_000_000_000,
					}

					const msg = createGauge({
						isPerpetual: data.isPerpetual,
						owner: authStore.osmosisAddress,
						coins: coins(data.amount, data.coin.denom),
						numEpochsPaidOver: Long.fromNumber(data.numEpochsPaidOver),
						startTime: new Date(data.startTime),
						distributeTo: {
							lockQueryType: 0,
							denom: `gamm/pool/${data.denom}`,
							duration: durationObj,
							timestamp: new Date(),
						},
					})

					const res = await signAndBroadcast({
						client,
						chainId: "osmosis-1",
						address: authStore.osmosisAddress,
						msgs: [msg],
						fee: osmosisStdFee,
						memo: "",
					})

					const parsedLogs = logs.parseLogs(logs.parseRawLog(res.rawLog))

					const gaugeAttr = logs.findAttribute(parsedLogs, "create_gauge", "key")

					const gaugeID = gaugeAttr.value.slice(1, -1)

					console.log(gaugeAttr, gaugeID)
				}
			} catch (error) {
				console.error(error)
				throw error
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
