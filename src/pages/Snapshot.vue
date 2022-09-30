<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { btsgStakingCoin } from "@/configs"
import { SnapshotSearch, TableColumn } from "@/models"
import { DelegationResponse } from "@bitsongjs/client/dist/codec/cosmos/staking/v1beta1/staking"
import { Coin } from "@bitsongjs/client/dist/codec/cosmos/base/v1beta1/coin"
import { fromBaseToDisplay } from "@/utils"
import { BigNumber } from "bignumber.js"
import { exportFile, useQuasar } from "quasar"
import useSnapshot from "@/store/snapshot"
import useChain from "@/store/chain"

const snapshotStore = useSnapshot()
const chainStore = useChain()
const quasar = useQuasar()

const validatorSearchTxt = ref("")

const snapshotForm = reactive<SnapshotSearch>({
	height: undefined,
	validators: [],
	tokens: 2000,
})

const columns: TableColumn[] = [
	{
		name: "address",
		required: true,
		label: "Address",
		align: "left",
		sortable: true,
		field: (row: DelegationResponse) => row.delegation?.delegatorAddress,
	},
	{
		name: "tokens",
		required: true,
		label: `Tokens ${btsgStakingCoin?.symbol}`,
		align: "left",
		sortable: true,
		sort: (a: Coin, b: Coin) => {
			return (
				new BigNumber(b.amount).toNumber() - new BigNumber(a.amount).toNumber()
			)
		},
		field: (row: DelegationResponse) => row.balance,
		format: (coin: Coin) => {
			const newCoin = btsgStakingCoin
				? fromBaseToDisplay(coin, btsgStakingCoin)
				: coin

			return `${newCoin.amount}`
		},
	},
]

const pagination = {
	sortBy: "tokens",
	descending: false,
}

const validatorOptions = computed(() => {
	if (validatorSearchTxt.value.length <= 0) {
		return snapshotStore.validatorOptions
	}

	return snapshotStore.validatorOptions.filter((validator) => {
		return validator.label
			.toLowerCase()
			.includes(validatorSearchTxt.value.toLowerCase())
	})
})

const onSubmit = () => {
	snapshotStore.loadDelegators(snapshotForm)
}

const onReset = () => {
	snapshotForm.height = undefined
	snapshotForm.validators = []
	snapshotForm.tokens = 2000
}

const loadValidators = async (
	value: string,
	update: (callback: () => void) => void
) => {
	update(() => {
		validatorSearchTxt.value = value

		if (snapshotStore.validators.length === 0) {
			snapshotStore.loadValidators()
		}
	})
}

const exportJsonTable = () => {
	const content = snapshotStore.delegators.map((delegator) => ({
		address: delegator.delegation?.delegatorAddress,
		amount: delegator.balance?.amount,
	}))

	const status = exportFile(
		"table-export.json",
		JSON.stringify(content),
		"application/json"
	)

	if (status !== true) {
		quasar.notify({
			message: "Browser denied file download...",
			color: "negative",
			icon: "warning",
		})
	}
}
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Snapshot</h4>
					</div>
				</div>
			</div>

			<div class="col-auto">
				<q-form
					@submit="onSubmit"
					class="q-col-gutter-md row q-mb-lg"
					@reset="onReset"
				>
					<q-input
						class="col-12 col-md-4 col-lg-3"
						label="Height"
						dense
						filled
						v-model.number="snapshotForm.height"
						:loading="chainStore.loadingBlock"
						type="number"
						clearable
					/>
					<q-select
						class="col-12 col-md-4 col-lg-3"
						label="Validator"
						dense
						filled
						v-model="snapshotForm.validators"
						:options="validatorOptions"
						:loading="snapshotStore.loadingValidators"
						map-options
						emit-value
						multiple
						use-chips
						@filter="loadValidators"
						use-input
					/>
					<q-input
						class="col-12 col-md-4 col-lg-3"
						label="Min Tokens Amount"
						dense
						filled
						v-model.number="snapshotForm.tokens"
						type="number"
						:suffix="btsgStakingCoin?.symbol"
						:rules="[
							(val) => val > 0 || 'Please use a value equal or greater then zero',
						]"
					/>

					<div class="col-12 flex justify-end">
						<q-btn type="submit" color="primary">
							<q-icon name="search" />
						</q-btn>
						<q-btn type="reset" class="q-ml-sm" color="secondary" label="reset" />
					</div>
				</q-form>

				<q-table
					title="Delegators"
					:rows="snapshotStore.delegators"
					:loading="snapshotStore.loading"
					:columns="columns"
					:pagination="pagination"
					row-key="address"
				>
					<template v-slot:top-right>
						<q-btn
							color="primary"
							icon-right="archive"
							label="Export to JSON"
							no-caps
							@click="exportJsonTable"
						/>
					</template>
				</q-table>
			</div>
		</div>
	</q-page>
</template>
