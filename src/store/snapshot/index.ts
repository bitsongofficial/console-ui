import { bitsongClient } from "@/services"
import {
	DelegationResponse,
	Validator,
} from "@bitsongjs/client/dist/codec/cosmos/staking/v1beta1/staking"
import { QueryClientImpl as StakingQueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/staking/v1beta1/query"
import { acceptHMRUpdate, defineStore } from "pinia"
import { BigNumber } from "bignumber.js"
import { SnapshotSearch } from "@/models"
import { reduce, groupBy, compact } from "lodash"
import { btsgStakingCoin } from "@/configs"
import { fromBaseToDisplay, gteCoin, sumCoins } from "@/utils"
import Long from "long"
import { lastValueFrom } from "rxjs"

export interface SnapshotState {
	loading: boolean
	loadingValidators: boolean
	submitting: boolean
	validators: Validator[]
	delegators: DelegationResponse[]
}

const useSnapshot = defineStore("snapshot", {
	state: (): SnapshotState => ({
		loading: false,
		loadingValidators: false,
		submitting: false,
		validators: [],
		delegators: [],
	}),
	actions: {
		async loadValidators() {
			try {
				this.loadingValidators = true

				const query = await lastValueFrom(bitsongClient.query)

				const response = await query.staking.Validators({
					$type: "cosmos.staking.v1beta1.QueryValidatorsRequest",
					status: "BOND_STATUS_BONDED",
					pagination: {
						$type: "cosmos.base.query.v1beta1.PageRequest",
						key: new Uint8Array([]),
						limit: Long.fromNumber(9999),
						countTotal: true,
						reverse: false,
						offset: Long.fromNumber(0),
					},
				})

				const validators = response.validators.sort(
					(a, b) =>
						new BigNumber(b.tokens).toNumber() - new BigNumber(a.tokens).toNumber()
				)

				this.validators = validators
			} catch (error) {
				console.error(error)
			} finally {
				this.loadingValidators = false
			}
		},
		async loadDelegators(search: SnapshotSearch) {
			try {
				this.loading = true

				if (this.validators.length === 0) {
					await this.loadValidators()
				}

				const query = await lastValueFrom(bitsongClient.query)

				const heightStakingClient = search.height
					? query.staking.setHeight(search.height)
					: query.staking

				const validatorAddresses =
					search.validators.length > 0
						? search.validators
						: this.validators.map((validator) => validator.operatorAddress)

				const delegationsRequests = validatorAddresses.map((validatorAddr) =>
					heightStakingClient.ValidatorDelegations({
						$type: "cosmos.staking.v1beta1.QueryValidatorDelegationsRequest",
						validatorAddr,
						pagination: {
							$type: "cosmos.base.query.v1beta1.PageRequest",
							key: new Uint8Array([]),
							limit: Long.fromNumber(9999),
							countTotal: true,
							reverse: false,
							offset: Long.fromNumber(0),
						},
					})
				)

				const delegatorsResponses = (await Promise.all(delegationsRequests)).map(
					(response) => response.delegationResponses
				)

				const delegatorsByValidator = reduce<
					DelegationResponse[],
					DelegationResponse[]
				>(delegatorsResponses, (prev, curr) => [...prev, ...curr], [])

				const delegatorsMap = groupBy(
					delegatorsByValidator,
					(delegator) => delegator.delegation?.delegatorAddress
				)

				const delegators = compact(
					Object.keys(delegatorsMap).map((key) => {
						const compact = reduce<DelegationResponse>(
							delegatorsMap[key],
							(prev, curr) => ({
								...prev,
								...curr,
								balance:
									prev.balance && curr.balance && btsgStakingCoin
										? sumCoins(prev.balance, curr.balance, btsgStakingCoin)
										: undefined,
							})
						)

						return compact
					})
				)

				this.delegators = delegators.filter((delegator) => {
					if (delegator.balance && btsgStakingCoin) {
						const newCoin = fromBaseToDisplay(delegator.balance, btsgStakingCoin)

						return gteCoin(newCoin, search.tokens)
					}

					return false
				})
			} catch (error) {
				console.error(error)
			} finally {
				this.loading = false
			}
		},
	},
	getters: {
		validatorOptions: ({ validators }) =>
			validators.map((validator) => ({
				label: validator.description?.moniker ?? "Not Found",
				value: validator.operatorAddress,
			})),
	},
	persistedState: {
		persist: false,
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSnapshot, import.meta.hot))
}

export default useSnapshot
