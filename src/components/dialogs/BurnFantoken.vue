<script lang="ts" setup>
import {
	isNaN,
	gtnZero,
	compareBalance,
	isNegative,
	toMicroUnit,
} from "@/utils"
import { BurnFantoken } from "@/models"
import { useDialogPluginComponent, useQuasar } from "quasar"
import { computed, reactive } from "vue"
import { FanToken } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/fantoken"
import useFantoken from "@/store/fantoken"
import useBank from "@/store/bank"

const props = defineProps<{
	fantoken: FanToken
}>()

const fantokenStore = useFantoken()
const bankStore = useBank()
const quasar = useQuasar()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
	useDialogPluginComponent()

const dataForm = reactive<BurnFantoken>({
	amount: 0,
})

const onSubmit = async () => {
	try {
		await fantokenStore.burnFantoken(dataForm, props.fantoken)

		onDialogOK()

		quasar.notify({
			message: `Burned tokens of ${props.fantoken.metaData?.name}`,
			color: "positive",
			icon: "warning",
			closeBtn: true,
			timeout: 10000,
		})
	} catch (error) {
		console.error(error)

		quasar.notify({
			message: `Something went wrong: ${(error as Error).message}`,
			color: "negative",
			icon: "warning",
			closeBtn: true,
			timeout: 10000,
		})
	}
}

const availableCoins = computed(() => {
	const balance = bankStore.balance(props.fantoken.denom)

	if (balance) {
		return balance.amount
	}

	return "0"
})
</script>

<template>
	<q-dialog ref="dialogRef" @hide="onDialogHide">
		<q-card class="q-dialog-plugin">
			<q-form @submit="onSubmit">
				<q-card-section>
					<p class="text-bold text-h6">Burn {{ fantoken.metaData?.name }}</p>
					<div class="q-col-gutter-md row q-mb-lg">
						<q-input
							class="col-12"
							label="Amount"
							dense
							filled
							v-model.number="dataForm.amount"
							:suffix="fantoken.metaData?.symbol.toUpperCase() ?? ''"
							type="number"
							:rules="[
								(val) => !!val || 'Required field',
								(val) => !isNaN(val) || 'Amount must be a decimal value',
								(val) => gtnZero(val) || 'Amount must be a greater then zero',
								(val) =>
									compareBalance(val, availableCoins) ||
									'Amount greater then available tokens',
								(val) => !isNegative(val) || 'Amount must be greater then zero',
							]"
							placeholder="0"
							:hint="`Available: ${availableCoins} ${fantoken.metaData?.symbol}`"
						/>

						<p class="col-12" v-if="fantokenStore.burnFee">
							<span class="text-bold">Burn fee:</span>
							{{ fantokenStore.burnFee.amount }}
							<span class="text-uppercase">{{ fantokenStore.burnFee.denom }}</span>
						</p>
					</div>
				</q-card-section>
				<q-card-actions align="right">
					<q-btn
						color="primary"
						label="Burn"
						type="submit"
						:loading="fantokenStore.burning"
					/>
					<q-btn color="secondary" label="Cancel" @click="onDialogCancel" />
				</q-card-actions>
			</q-form>
		</q-card>
	</q-dialog>
</template>
