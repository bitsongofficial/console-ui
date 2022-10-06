<script setup lang="ts">
import {
	isNaN,
	gtnZero,
	compareBalance,
	isNegative,
	toMicroUnit,
	fromDisplayToBase,
} from "@/utils"
import { CreateGauge, GaugeDuration } from "@/models"
import { reactive } from "vue"
import useAuth from "@/store/auth"
import useOsmosis from "@/store/osmosis"
import { ibcMap } from "@/configs"
import { Asset } from "@chain-registry/types"
import { useQuasar } from "quasar"

const quasar = useQuasar()
const authStore = useAuth()
const osmosisStore = useOsmosis()

const dataForm = reactive<CreateGauge>({
	isPerpetual: false,
	denom: "",
	duration: GaugeDuration["1D"],
	coin: undefined,
	amount: "0",
	startTime: "",
	numEpochsPaidOver: 240,
})

const durationOptions = [
	GaugeDuration["1D"],
	GaugeDuration["7D"],
	GaugeDuration["14D"],
]

const onSubmit = async () => {
	try {
		const ibcMapOsmosis = ibcMap.find((el) => el.chain_name === "osmosis")

		if (ibcMapOsmosis && dataForm.coin) {
			const asset = ibcMapOsmosis.assets.find(
				(el: Asset) => el.display === dataForm.coin?.denom
			)

			if (asset) {
				await osmosisStore.createNewGauge({
					...dataForm,
					coin: fromDisplayToBase(dataForm.coin, asset),
					amount: toMicroUnit(dataForm.amount),
				})

				onReset()

				quasar.notify({
					message: "New gauge created",
					color: "positive",
					icon: "warning",
					closeBtn: true,
					timeout: 10000,
				})
			}
		}
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

const onReset = () => {
	dataForm.isPerpetual = false
	dataForm.denom = ""
	dataForm.duration = GaugeDuration["1D"]
	dataForm.coin = undefined
	dataForm.amount = "0"
	dataForm.startTime = ""
	dataForm.numEpochsPaidOver = 240
}
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Osmosis Gauges</h4>
					</div>
				</div>
			</div>

			<q-card class="q-pa-lg q-mb-lg" bordered>
				<q-form @submit="onSubmit" class="q-col-gutter-md row" @reset="onReset">
					<q-select
						class="col-12 col-md-6"
						label="Distribution Denom"
						dense
						filled
						v-model="dataForm.coin"
						:options="osmosisStore.balances"
						option-label="denom"
						:option-value="(item) => item"
						:rules="[(val) => !!val || 'Required']"
					/>

					<q-input
						class="col-12 col-md-6"
						label="Distribution Amount"
						dense
						filled
						v-model="dataForm.amount"
						:readonly="!dataForm.coin"
						:suffix="dataForm.coin?.denom.slice(0, 6).toUpperCase()"
						:rules="[
							(val) => !!val || 'Required field',
							(val) => !isNaN(val) || 'Amount must be a decimal value',
							(val) => gtnZero(val) || 'Amount must be a greater then zero',
							(val) =>
								compareBalance(val, dataForm.coin?.amount ?? '0') ||
								'Amount greater then available balance',
							(val) => !isNegative(val) || 'Amount must be greater then zero',
						]"
						placeholder="0"
					/>

					<q-select
						class="col-12 col-md-6"
						label="Duration"
						dense
						filled
						v-model="dataForm.duration"
						:options="durationOptions"
						:rules="[(val) => !!val || 'Required']"
					/>

					<q-input
						class="col-12 col-md-6"
						label="Denom"
						dense
						filled
						prefix="gamm/pool/"
						v-model="dataForm.denom"
						:rules="[(val) => !!val || 'Required']"
					/>

					<q-input
						class="col-12 col-md-6"
						label="Start Time"
						dense
						filled
						v-model="dataForm.startTime"
						:rules="[(val) => !!val || 'Required']"
					>
						<template v-slot:prepend>
							<q-icon name="event" class="cursor-pointer">
								<q-popup-proxy cover transition-show="scale" transition-hide="scale">
									<q-date v-model="dataForm.startTime" mask="YYYY-MM-DD HH:mm">
										<div class="row items-center justify-end">
											<q-btn v-close-popup label="Close" color="primary" flat />
										</div>
									</q-date>
								</q-popup-proxy>
							</q-icon>
						</template>

						<template v-slot:append>
							<q-icon name="access_time" class="cursor-pointer">
								<q-popup-proxy cover transition-show="scale" transition-hide="scale">
									<q-time v-model="dataForm.startTime" mask="YYYY-MM-DD HH:mm" format24h>
										<div class="row items-center justify-end">
											<q-btn v-close-popup label="Close" color="primary" flat />
										</div>
									</q-time>
								</q-popup-proxy>
							</q-icon>
						</template>
					</q-input>

					<q-input
						class="col-12 col-md-6"
						label="Epochs Paid Over"
						dense
						filled
						v-model.number="dataForm.numEpochsPaidOver"
						type="number"
						:rules="[
							(val) => val >= 0 || 'Please use a value greater or equal to zero',
						]"
					/>

					<div class="col-auto q-ml-auto">
						<q-checkbox left-label v-model="dataForm.isPerpetual" label="Perpetual" />
					</div>

					<div class="col-12 flex justify-end">
						<q-btn type="reset" color="secondary" label="reset" />
						<q-btn
							type="submit"
							color="primary"
							class="q-ml-sm"
							:disable="!authStore.session"
							:loading="osmosisStore.creatingGauge"
						>
							<q-icon name="send" />
						</q-btn>
					</div>
				</q-form>
			</q-card>
		</div>
	</q-page>
</template>
