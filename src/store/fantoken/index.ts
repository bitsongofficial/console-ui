import { bitsongClient } from "@/services"
import { FanToken } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/fantoken"
import {
	QueryFanTokensRequest,
	QueryParamsRequest,
} from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/query"
import { Params } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/params"
import {
	MsgIssue,
	MsgMint,
	MsgBurn,
	MsgSetUri,
	MsgSetAuthority,
	MsgSetMinter,
	MsgDisableMint,
} from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/tx"
import {
	PageRequest,
	PageResponse,
} from "@bitsongjs/client/dist/codec/cosmos/base/query/v1beta1/pagination"
import Long from "long"
import { acceptHMRUpdate, defineStore } from "pinia"
import { bitsongStdFee, btsgStakingCoin } from "@/configs"
import { fromBaseToDisplay, toMicroUnit } from "@/utils"
import { BurnFantoken, IssueFantoken, MintFantoken } from "@/models"
import useAuth from "../auth"
import { DeliverTxResponse, logs } from "@cosmjs/stargate"
import { sortBy } from "lodash"
import { lastValueFrom } from "rxjs"
import useBank from "../bank"

export interface FantokenState {
	loading: boolean
	issuing: boolean
	minting: boolean
	burning: boolean
	disablingMinting: boolean
	changingUri: boolean
	changingAuthority: boolean
	changingMinter: boolean
	loadingParams: boolean
	fantokens: FanToken[]
	fantokensPagination?: PageResponse
	params?: Params
}

const useFantoken = defineStore("fantoken", {
	state: (): FantokenState => ({
		loading: false,
		issuing: false,
		minting: false,
		burning: false,
		disablingMinting: false,
		changingUri: false,
		changingAuthority: false,
		changingMinter: false,
		loadingParams: false,
		fantokens: [],
		fantokensPagination: undefined,
		params: undefined,
	}),
	actions: {
		async loadParams() {
			try {
				this.loadingParams = true

				const query = await lastValueFrom(bitsongClient.query)

				const params = await query.fantoken.Params({
					$type: QueryParamsRequest.$type,
				})

				this.params = params.params
			} catch (error) {
				console.error(error)
			} finally {
				this.loadingParams = false
			}
		},
		async loadFantokens(
			authority: string = "",
			limit = 9999,
			nextKey = new Uint8Array([])
		) {
			const authStore = useAuth()
			try {
				this.loading = true

				const query = await lastValueFrom(bitsongClient.query)

				const response = await query.fantoken.FanTokens({
					$type: QueryFanTokensRequest.$type,
					authority,
					pagination: {
						$type: PageRequest.$type,
						key: nextKey,
						limit: Long.fromNumber(limit),
						countTotal: true,
						reverse: false,
						offset: Long.fromNumber(0),
					},
				})

				this.fantokens = response.fantokens
				this.fantokensPagination = response.pagination
			} catch (error) {
				console.error(error)
			} finally {
				this.loading = false
			}
		},
		async issueFantoken(payload: IssueFantoken) {
			const authStore = useAuth()

			if (bitsongClient && bitsongClient.txClient && authStore.bitsongAddress) {
				try {
					this.issuing = true

					const msg = MsgIssue.fromPartial({
						name: payload.name,
						symbol: payload.symbol,
						uri: payload.uri,
						maxSupply: toMicroUnit(payload.maxSupply),
						authority: payload.authority,
						minter: payload.minter,
					})

					console.log(msg)

					const txClient = await lastValueFrom(bitsongClient.txClient)

					console.log(
						txClient?.signingClient.registry.lookupType("/bitsong.fantoken.MsgIssue"),
						txClient?.signingClient.registry
					)

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

							try {
								const parsedLogs = logs.parseLogs(logs.parseRawLog(txRes.rawLog))

								const denomAttr = logs.findAttribute(
									parsedLogs,
									"bitsong.fantoken.v1beta1.EventIssue",
									"denom"
								)
								return denomAttr.value.slice(1, -1)	
							} catch (error) {
								throw new Error(txRes.rawLog)
							}
						}
					}
				} catch (error) {
					console.error(error)
					throw error
				} finally {
					this.issuing = false
				}
			}
		},
		async mintFantoken(payload: MintFantoken, fantoken: FanToken) {
			const authStore = useAuth()
			const bankStore = useBank()

			if (bitsongClient && bitsongClient.txClient && authStore.bitsongAddress) {
				try {
					this.minting = true

					const amountMicro = toMicroUnit(payload.amount)

					const msg = MsgMint.fromPartial({
						coin: {
							amount: amountMicro,
							denom: fantoken.denom,
						},
						recipient: payload.recipient,
						minter: authStore.bitsongAddress,
					})

					const txClient = await lastValueFrom(bitsongClient.txClient)

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

							bankStore.loadBalance()
						}
					}
				} catch (error) {
					console.error(error)
					throw error
				} finally {
					this.minting = false
				}
			}
		},
		async burnFantoken(payload: BurnFantoken, fantoken: FanToken) {
			const authStore = useAuth()
			const bankStore = useBank()

			if (bitsongClient && bitsongClient.txClient && authStore.bitsongAddress) {
				try {
					this.burning = true

					const amountMicro = toMicroUnit(payload.amount)

					const msg = MsgBurn.fromPartial({
						coin: {
							amount: amountMicro,
							denom: fantoken.denom,
						},
						sender: authStore.bitsongAddress,
					})

					const txClient = await lastValueFrom(bitsongClient.txClient)

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

							bankStore.loadBalance()
						}
					}
				} catch (error) {
					console.error(error)
					throw error
				} finally {
					this.burning = false
				}
			}
		},
		async setUriFantoken(payload: Partial<IssueFantoken>, fantoken: FanToken) {
			const authStore = useAuth()

			if (bitsongClient && bitsongClient.txClient && authStore.bitsongAddress) {
				try {
					this.changingUri = true

					const msg = MsgSetUri.fromPartial({
						denom: fantoken.denom,
						authority: fantoken.metaData?.authority ?? authStore.bitsongAddress,
						uri: payload.uri ?? fantoken.metaData?.uri,
					})

					const txClient = await lastValueFrom(bitsongClient.txClient)

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
				} catch (error) {
					console.error(error)
					throw error
				} finally {
					this.changingUri = false
				}
			}
		},
		async setAuthorityFantoken(
			payload: Partial<IssueFantoken>,
			fantoken: FanToken
		) {
			const authStore = useAuth()

			if (bitsongClient && bitsongClient.txClient && authStore.bitsongAddress) {
				try {
					this.changingAuthority = true

					const msg = MsgSetAuthority.fromPartial({
						denom: fantoken.denom,
						oldAuthority: fantoken.metaData?.authority ?? authStore.bitsongAddress,
						newAuthority: payload.authority ?? fantoken.metaData?.authority,
					})

					const txClient = await lastValueFrom(bitsongClient.txClient)

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
				} catch (error) {
					console.error(error)
					throw error
				} finally {
					this.changingAuthority = false
				}
			}
		},
		async setMinterFantoken(payload: Partial<IssueFantoken>, fantoken: FanToken) {
			const authStore = useAuth()

			if (bitsongClient && bitsongClient.txClient && authStore.bitsongAddress) {
				try {
					this.changingMinter = true

					const msg = MsgSetMinter.fromPartial({
						denom: fantoken.denom,
						oldMinter: fantoken.minter,
						newMinter: payload.minter,
					})

					const txClient = await lastValueFrom(bitsongClient.txClient)

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
				} catch (error) {
					console.error(error)
					throw error
				} finally {
					this.changingMinter = false
				}
			}
		},
		async disableMint(fantoken: FanToken) {
			const authStore = useAuth()

			if (bitsongClient && bitsongClient.txClient && authStore.bitsongAddress) {
				try {
					this.disablingMinting = true

					const msg = MsgDisableMint.fromPartial({
						denom: fantoken.denom,
						minter: fantoken.minter,
					})

					const txClient = await lastValueFrom(bitsongClient.txClient)

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
				} catch (error) {
					console.error(error)
					throw error
				} finally {
					this.disablingMinting = false
				}
			}
		},
	},
	getters: {
		sortedFantokens: ({ fantokens }) => {
			const authStore = useAuth()

			return sortBy(fantokens, (fantoken) => {
				if (authStore.bitsongAddress) {
					return fantoken.minter !== authStore.bitsongAddress
				}

				return fantoken.metaData?.name ?? fantoken.denom
			})
		},
		issueFee: ({ params }) => {
			if (params && params.issueFee && btsgStakingCoin) {
				return fromBaseToDisplay(params.issueFee, btsgStakingCoin)
			}
		},
		mintFee: ({ params }) => {
			if (params && params.mintFee && btsgStakingCoin) {
				return fromBaseToDisplay(params.mintFee, btsgStakingCoin)
			}
		},
		burnFee: ({ params }) => {
			if (params && params.burnFee && btsgStakingCoin) {
				return fromBaseToDisplay(params.burnFee, btsgStakingCoin)
			}
		},
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useFantoken, import.meta.hot))
}

export default useFantoken
