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
import { useDialogPluginComponent, useQuasar } from "quasar"
import { computed, onMounted, reactive } from "vue"
import { FanToken } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/fantoken"
import useAuth from "@/store/auth"
import useFantoken from "@/store/fantoken"

const props = defineProps<{
	fantoken: FanToken
}>()

const authStore = useAuth()
const fantokenStore = useFantoken()
const quasar = useQuasar()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
	useDialogPluginComponent()

const dataForm = reactive<MintFantoken>({
	amount: 0,
	recipient: "",
})

onMounted(() => {
	if (authStore.bitsongAddress) {
		dataForm.recipient = authStore.bitsongAddress
	}
})

const onSubmit = async () => {
	try {
		await fantokenStore.mintFantoken(dataForm, props.fantoken)

		onDialogOK()

		quasar.notify({
			message: `Minted tokens of ${props.fantoken.metaData?.name}`,
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
	const maxSupply = toMicroUnit(props.fantoken.maxSupply, -6)

	return maxSupply
})
</script>

<template>
	<q-dialog ref="dialogRef" @hide="onDialogHide">
		<q-card class="q-dialog-plugin">
			<q-form @submit="onSubmit">
				<q-card-section>
					<p class="text-bold text-h6">Mint {{ fantoken.metaData?.name }}</p>
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
									'Amount greater then max supply',
								(val) => !isNegative(val) || 'Amount must be greater then zero',
							]"
							placeholder="0"
						/>
						<q-input
							class="col-12"
							label="Authority"
							dense
							filled
							v-model="dataForm.recipient"
							hint="Address of minting receiver"
							:rules="[
								(val) => !!val || 'Recipient field is required',
								(val) =>
									isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
									'Invalid address',
							]"
						/>

						<p class="col-12" v-if="fantokenStore.mintFee">
							<span class="text-bold">Mint fee:</span>
							{{ fantokenStore.mintFee.amount }}
							<span class="text-uppercase">{{ fantokenStore.mintFee.denom }}</span>
						</p>
					</div>
				</q-card-section>
				<q-card-actions align="right">
					<q-btn
						color="primary"
						label="Mint"
						type="submit"
						:loading="fantokenStore.minting"
					/>
					<q-btn color="secondary" label="Cancel" @click="onDialogCancel" />
				</q-card-actions>
			</q-form>
		</q-card>
	</q-dialog>
</template>
