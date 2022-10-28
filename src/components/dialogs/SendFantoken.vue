<script lang="ts" setup>
import { isValidAddress } from "@/common"
import {
	isNaN,
	gtnZero,
	compareBalance,
	isNegative,
	toMicroUnit,
} from "@/utils"
import { bitsongChain } from "@/configs"
import { MintFantoken } from "@/models"
import { QBtn, QCard, QCardActions, QCardSection, QDialog, QForm, QInput, useDialogPluginComponent, useQuasar } from "quasar"
import { computed, onMounted, reactive } from "vue"
import { FanToken } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/fantoken"
import useAuth from "@/store/auth"
import useFantoken from "@/store/fantoken"
import { coin, Coin } from "@cosmjs/proto-signing"
import useBank from "@/store/bank"
import fantoken from "@/store/fantoken"

const props = defineProps<{
	balance: Coin
}>()

const authStore = useAuth()
const bankStore = useBank()
const fantokenStore = useFantoken()
const quasar = useQuasar()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
	useDialogPluginComponent()

const dataForm = reactive({
	amount: 0,
    recipient: ""
})


onMounted(() => {
	if (authStore.bitsongAddress) {
		dataForm.recipient = authStore.bitsongAddress
	}
})

const onSubmit = async () => {
	try {
        const amount = coin(toMicroUnit(dataForm.amount), props.balance.denom)
        await bankStore.sendCoin(dataForm.recipient, amount)

		onDialogOK()

		quasar.notify({
			message: `Coin sent ${dataForm.amount} ${props.balance.denom}`,
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

</script>

<template>
	<q-dialog ref="dialogRef" @hide="onDialogHide">
		<q-card class="q-dialog-plugin">
			<q-form @submit="onSubmit">
				<q-card-section>
					<p class="text-bold text-h6">Send {{ balance.denom }}</p>
					<div class="q-col-gutter-md row q-mb-lg">
                        <q-input
							class="col-12"
							label="From Address"
							dense
							filled
							v-model="authStore.bitsongAddress"
							hint="From address"
                            disable
						/>
						<q-input
							class="col-12"
							label="Recipient"
							dense
							filled
							v-model="dataForm.recipient"
							hint="Recipient address"
							:rules="[
								(val) => !!val || 'Recipient field is required',
								(val) =>
									isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
									'Invalid address',
							]"
						/>
                        <q-input
							class="col-12"
							label="Amount"
							dense
							filled
							v-model.number="dataForm.amount"
							:suffix="balance.denom.toUpperCase()"
							type="number"
							:rules="[
								(val) => !!val || 'Required field',
								(val) => !isNaN(val) || 'Amount must be a decimal value',
								(val) => gtnZero(val) || 'Amount must be a greater then zero',
								(val) => !isNegative(val) || 'Amount must be greater then zero',
							]"
							placeholder="0"
						/>

					</div>
				</q-card-section>
				<q-card-actions align="right">
					<q-btn color="secondary" label="Cancel" @click="onDialogCancel" />
					<q-btn
						color="primary"
						label="Send coin"
						type="submit"
						:loading="bankStore.transfering"
					/>
				</q-card-actions>
			</q-form>
		</q-card>
	</q-dialog>
</template>
