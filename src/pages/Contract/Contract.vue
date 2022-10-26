<script setup lang="ts">
import { isValidAddress, isValidJSON } from "@/common"
import { bitsongChain, btsgAssets } from "@/configs"
import { onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import useAuth from "@/store/auth"
import useCosmWasm from "@/store/cosmwasm"
import { useQuasar } from "quasar"
import useBank from "@/store/bank"
import { ExecuteContract } from "@/models"
import { compact } from "lodash"
import { compareBalance, fromDisplayToBase, gtnZero } from "@/utils"

const quasar = useQuasar()
const bankStore = useBank()
const cosmWasmStore = useCosmWasm()
const authStore = useAuth()
const route = useRoute()
const router = useRouter()

const contract = route.params.contract as string

const initialState: ExecuteContract = {
	msg: "",
	funds: [],
}

const instantiateForm = reactive(initialState)

const queryMsg = ref("")
const queryOutput = ref("")

onMounted(async () => {
	if (
		!bitsongChain ||
		!isValidAddress(contract, bitsongChain?.bech32_prefix, 32)
	) {
		await router.replace("/contracts")
	} else {
		cosmWasmStore.getContract(contract)
	}
})

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
						<h4 class="q-mb-lg q-mt-none text-bold">Contract</h4>
					</div>
				</div>
			</div>

			<q-card class="q-mb-lg" bordered>
				<template v-if="!cosmWasmStore.loadingContract && !cosmWasmStore.contract">
					<q-card-section>
						<pre>Please use a valid address</pre>
					</q-card-section>
				</template>
				<template v-else-if="cosmWasmStore.contract">
					<q-card-section class="row">
						<p class="q-mb-none flex items-center">
							{{ cosmWasmStore.contract.address }}
						</p>
						<q-btn
							color="secondary"
							label="Interact (Query/Execute)"
							no-caps
							class="q-ml-auto"
							href="#interact"
						/>
					</q-card-section>
					<q-separator />
					<q-card-section>
						<p class="text-bold">Code ID</p>
						<p>{{ cosmWasmStore.contract.codeId }}</p>
						<p class="text-bold">Creator</p>
						<p>{{ cosmWasmStore.contract.creator }}</p>
					</q-card-section>

					<q-card-section v-if="cosmWasmStore.contractHistory.length > 0">
						<template v-for="history of cosmWasmStore.contractHistory">
							<p>{{ history.operation }}Msg</p>
							<pre class="q-pa-md border-1 border-gray border-solid rounded-borders">{{
								history.msg
							}}</pre>
						</template>
					</q-card-section>
				</template>
			</q-card>

			<div class="q-col-gutter-sm row" id="interact">
				<q-form
					class="col-12 col-md-6"
					@submit="submitExecute"
					@reset="resetExecute"
				>
					<q-card class="q-pa-lg full-height" bordered>
						<div class="q-col-gutter-md row full-height">
							<p class="text-bold">Execute</p>
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
							<p class="text-bold">Query</p>
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
								<p class="text-bold">Query Output</p>
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
