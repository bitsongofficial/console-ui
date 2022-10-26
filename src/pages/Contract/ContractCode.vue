<script setup lang="ts">
import { bitsongChain, btsgAssets } from "@/configs"
import { InstantiateContract, TableColumn } from "@/models"
import { compareBalance, fromDisplayToBase, gtnZero } from "@/utils"
import { compact } from "lodash"
import { useQuasar } from "quasar"
import { onMounted, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import useCosmWasm from "@/store/cosmwasm"
import { isValidAddress, isValidJSON } from "@/common"
import useAuth from "@/store/auth"
import useBank from "@/store/bank"

const quasar = useQuasar()
const cosmWasmStore = useCosmWasm()
const authStore = useAuth()
const bankStore = useBank()
const router = useRouter()
const route = useRoute()

const code = parseInt(route.params.code as string, 10)

const initialState: InstantiateContract = {
	codeId: code ? code : 0,
	msg: "",
	label: "",
	funds: [],
	admin: "",
}

const instantiateForm = reactive(initialState)

onMounted(async () => {
	if (!code) {
		await router.replace("/contracts")
	} else {
		cosmWasmStore.getContracts(code)
	}
})

const submit = async () => {
	try {
		const funds = compact(
			instantiateForm.funds.map((fund) => {
				let asset = btsgAssets?.assets.find((el) => el.display === fund.denom)

				if (asset) {
					return fromDisplayToBase(fund, asset)
				}
			})
		)

		const result = await cosmWasmStore.instantiateCode({
			...instantiateForm,
			funds,
		})

		reset()

		quasar.notify({
			message: `New smartcontract created: ${result?.contractAddress}`,
			color: "positive",
			icon: "warning",
			closeBtn: true,
			timeout: 10000,
		})

		await router.push(`/contract/${result?.contractAddress}`)
	} catch (error) {
		quasar.notify({
			message: `Something went wrong: ${(error as Error).message}`,
			color: "negative",
			icon: "warning",
			closeBtn: true,
			timeout: 10000,
		})
	}
}

const reset = () => {
	Object.assign(instantiateForm, initialState)
}

const addFund = () => {
	instantiateForm.funds.push({
		amount: "0",
		denom: "",
	})
}

const removeFund = (index: number) => {
	instantiateForm.funds.splice(index, 1)
}

const columnsContracts: TableColumn[] = [
	{
		name: "address",
		required: true,
		label: "Contract Address",
		align: "left",
		field: "address",
		sortable: true,
	},
]

const paginationContracts = {
	rowsPerPage: 5,
}
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<q-btn
					icon="arrow_back"
					size="md"
					class="q-mb-md"
					color="primary"
					label="Back"
					no-caps
					@click="router.back()"
					unelevated
					flat
				/>
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Code {{ code }}</h4>
					</div>
					<div class="col-auto">
						<q-btn color="primary" label="Instantiate" no-caps href="#instantiate" />
					</div>
				</div>
			</div>

			<q-table
				:columns="columnsContracts"
				:pagination="paginationContracts"
				:rows="cosmWasmStore.contractsAddressesObj"
				:loading="cosmWasmStore.loadingContracts"
				class="q-mb-md"
			>
				<template v-slot:body-cell-address="props">
					<q-td :props="props">
						<router-link class="text-primary" :to="`/contract/${props.row.address}`">
							{{ props.row.address }}
						</router-link>
					</q-td>
				</template>
			</q-table>

			<q-form @submit="submit" @reset="reset" id="instantiate">
				<q-card class="q-pa-lg q-mb-lg" bordered>
					<div class="q-col-gutter-md row">
						<q-input
							class="col-12 col-md-6"
							label="Admin (optional)"
							dense
							filled
							v-model="instantiateForm.admin"
							:rules="[
								(val) =>
									val.length === 0 ||
									isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
									'Invalid address',
							]"
							placeholder="bitsong1..."
						/>

						<q-input
							class="col-12 col-md-6"
							label="Code ID"
							dense
							filled
							v-model.number="instantiateForm.codeId"
							:rules="[
								(val) => !!val || 'Required',
								(val) => val > 0 || 'Code ID must be greater then zero',
							]"
							type="number"
							placeholder="1"
						/>

						<q-input
							class="col-12"
							label="Init msg"
							dense
							filled
							v-model="instantiateForm.msg"
							:rules="[
								(val) => !!val || 'Required',
								(val) => isValidJSON(val) || 'Please add a valid JSON',
							]"
							type="textarea"
							rows="10"
						/>

						<q-input
							class="col-12"
							label="Label"
							dense
							filled
							v-model="instantiateForm.label"
							:rules="[(val) => !!val || 'Required']"
						/>

						<div class="col-12 row items-center">
							<h5 class="q-my-none">Funds</h5>

							<q-btn
								class="q-ml-md"
								color="primary"
								no-caps
								round
								rounded
								:disable="!authStore.session"
								size="sm"
								@click="addFund"
							>
								<q-icon name="add"></q-icon>
							</q-btn>
						</div>

						<p v-if="instantiateForm.funds.length === 0">
							There are no funds, press "+" to add one
						</p>

						<div
							v-for="(_, index) in instantiateForm.funds"
							:key="index"
							class="col-12"
						>
							<q-card class="q-pa-sm q-col-gutter-xs row" bordered>
								<q-select
									class="col-12 col-md-2"
									label="Denom"
									dense
									filled
									v-model="instantiateForm.funds[index].denom"
									:options="bankStore.balances"
									option-label="denom"
									option-value="denom"
									emit-value
									:rules="[(val) => !!val || 'Required']"
									hide-bottom-space
								/>
								<q-input
									class="col-12 col-md-8"
									label="Amount"
									dense
									filled
									v-model.number="instantiateForm.funds[index].amount"
									:rules="[
										(val) => !!val || 'Required field',
										(val) => !isNaN(val) || 'Amount must be a decimal value',
										(val) => gtnZero(val) || 'Amount must be a greater then zero',
										(val) =>
											compareBalance(
												val,
												bankStore.balanceDisplay(instantiateForm.funds[index].denom)
													?.amount ?? '0'
											) || 'Amount greater then available balance',
									]"
									hide-bottom-space
								/>

								<div class="col-auto row q-ml-auto">
									<q-btn
										class="q-my-auto"
										color="primary"
										no-caps
										round
										rounded
										:disable="!authStore.session"
										size="xs"
										@click="removeFund(index)"
									>
										<q-icon name="remove"></q-icon>
									</q-btn>
								</div>
							</q-card>
						</div>

						<div class="col-12 flex justify-end">
							<q-btn type="reset" color="secondary" label="reset" />
							<q-btn
								class="q-ml-sm"
								type="submit"
								label="Instantiate"
								color="primary"
								:disable="!authStore.session"
								:loading="cosmWasmStore.instantiating"
							/>
						</div>
					</div>
				</q-card>
			</q-form>
		</div>
	</q-page>
</template>
