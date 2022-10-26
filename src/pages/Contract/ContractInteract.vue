<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import { isValidJSON, isValidAddress } from "@/common"
import { bitsongChain, btsgAssets } from "@/configs"
import { useRoute, useRouter } from "vue-router"
import useCosmWasm from "@/store/cosmwasm"
import useAuth from "@/store/auth"
import { ExecuteContract } from "@/models"
import { compact } from "lodash"
import { compareBalance, fromDisplayToBase, gtnZero } from "@/utils"
import { useQuasar } from "quasar"
import useBank from "@/store/bank"

const quasar = useQuasar()
const bankStore = useBank()
const cosmWasmStore = useCosmWasm()
const authStore = useAuth()
const route = useRoute()
const router = useRouter()

const contract = route.params.contract as string

onMounted(async () => {
	if (
		!bitsongChain ||
		!isValidAddress(contract, bitsongChain?.bech32_prefix, 32)
	) {
		await router.replace("/contracts")
	}
})

const initialState: ExecuteContract = {
	msg: "",
	funds: [],
}

const instantiateForm = reactive(initialState)

const queryMsg = ref("")
const queryOutput = ref("")

const submitQuery = async () => {
	try {
		queryOutput.value = await cosmWasmStore.queryContractSmart(
			contract,
			queryMsg.value
		)
	} catch (error) {
		queryOutput.value = `Something went wrong: ${(error as Error).message}`
	}
}

const resetQuery = () => {
	queryMsg.value = ""
}

const submitExecute = async () => {
	try {
		const funds = compact(
			instantiateForm.funds.map((fund) => {
				let asset = btsgAssets?.assets.find((el) => el.display === fund.denom)

				if (asset) {
					return fromDisplayToBase(fund, asset)
				}
			})
		)

		await cosmWasmStore.executeContract(
			{
				...instantiateForm,
				funds,
			},
			contract
		)

		quasar.notify({
			message: "New message executed",
			color: "positive",
			icon: "warning",
			closeBtn: true,
			timeout: 10000,
		})
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

const resetExecute = () => {
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
						<h4 class="q-mb-lg q-mt-none text-bold">Interact</h4>
					</div>
				</div>
			</div>

			<div class="q-col-gutter-sm row">
				<q-form
					class="col-12 col-md-6"
					@submit="submitExecute"
					@reset="resetExecute"
				>
					<q-card class="q-pa-lg full-height" bordered>
						<div class="q-col-gutter-md row full-height">
							<q-input
								class="col-12"
								label="Msg"
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
										class="col-12 col-md-3"
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
										class="col-12 col-md-7"
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

							<div class="col-12 flex justify-end q-mt-auto">
								<q-btn type="reset" color="secondary" label="reset" />
								<q-btn
									class="q-ml-sm"
									type="submit"
									label="Execute"
									color="primary"
									:disable="!authStore.session"
									:loading="cosmWasmStore.executing"
								/>
							</div>
						</div>
					</q-card>
				</q-form>
				<q-form class="col-12 col-md-6" @submit="submitQuery" @reset="resetQuery">
					<q-card class="q-pa-lg full-height" bordered>
						<div class="q-col-gutter-md row full-height">
							<q-input
								class="col-12"
								label="Query Msg"
								dense
								filled
								v-model="queryMsg"
								:rules="[
									(val) => !!val || 'Required',
									(val) => isValidJSON(val) || 'Please add a valid JSON',
								]"
								type="textarea"
								rows="10"
							/>

							<div class="col-12">
								<q-card bordered>
									<q-card-section>
										<pre v-if="isValidJSON(queryOutput)">{{ queryOutput }}</pre>
										<p v-else>{{ queryOutput }}</p>
									</q-card-section>
								</q-card>
							</div>

							<div class="col-12 flex justify-end q-mt-auto">
								<q-btn type="reset" color="secondary" label="reset" />
								<q-btn
									class="q-ml-sm"
									type="submit"
									label="Query"
									color="primary"
									:disable="!authStore.session"
									:loading="cosmWasmStore.querying"
								/>
							</div>
						</div>
					</q-card>
				</q-form>
			</div>
		</div>
	</q-page>
</template>
