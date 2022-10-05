<script lang="ts" setup>
import {
	isNaN,
	gtnZero,
	compareBalance,
	isNegative,
	toMicroUnit,
	fromDisplayToBase,
} from "@/utils"
import { bitsongChain, btsgAssets } from "@/configs"
import { MintFantoken } from "@/models"
import { useDialogPluginComponent, useQuasar } from "quasar"
import { computed, onMounted, reactive } from "vue"
import useAuth from "@/store/auth"
import { coin, Coin } from "@cosmjs/proto-signing"
import useBank from "@/store/bank"

const props = defineProps<{
	balance: Coin
}>()

const authStore = useAuth()
const bankStore = useBank()
const quasar = useQuasar()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
	useDialogPluginComponent()

const dataForm = reactive({
	amount: 0,
})

const onSubmit = async () => {
	try {
		let asset = btsgAssets?.assets.find(
			(el) => el.display === props.balance.denom
		)

		let amountToTransfer: Coin | undefined = undefined

		console.log(asset)

		if (asset) {
			amountToTransfer = fromDisplayToBase(
				{
					...props.balance,
					amount: dataForm.amount.toString(),
				},
				asset
			)
		} else {
			amountToTransfer = coin(toMicroUnit(dataForm.amount), props.balance.denom)
		}

		if (amountToTransfer) {
			await bankStore.sendIbcTokensToOsmosis(amountToTransfer)

			onDialogOK()

			quasar.notify({
				message: "Tokens transfered",
				color: "positive",
				icon: "warning",
				closeBtn: true,
				timeout: 10000,
			})
		}
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
					<p class="text-bold text-h6">Transfer To Osmosis</p>
					<div class="q-col-gutter-md row q-mb-lg">
						<q-input
							class="col-12"
							label="Amount"
							dense
							filled
							v-model.number="dataForm.amount"
							:suffix="balance.denom.slice(0, 6)"
							type="number"
							:rules="[
								(val) => !!val || 'Required field',
								(val) => !isNaN(val) || 'Amount must be a decimal value',
								(val) => gtnZero(val) || 'Amount must be a greater then zero',
								(val) =>
									compareBalance(val, balance.amount) ||
									'Amount greater then max supply',
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
						label="Transfer"
						type="submit"
						:loading="bankStore.transfering"
					/>
				</q-card-actions>
			</q-form>
		</q-card>
	</q-dialog>
</template>
