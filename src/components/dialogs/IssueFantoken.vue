<script lang="ts" setup>
import { isValidAddress } from "@/common"
import { bitsongChain } from "@/configs"
import { IssueFantoken } from "@/models"
import { useDialogPluginComponent, useQuasar } from "quasar"
import { onMounted, reactive } from "vue"
import useAuth from "@/store/auth"
import useFantoken from "@/store/fantoken"

const authStore = useAuth()
const fantokenStore = useFantoken()
const quasar = useQuasar()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
	useDialogPluginComponent()

const dataForm = reactive<IssueFantoken>({
	name: "",
	symbol: "",
	uri: "",
	maxSupply: 0,
	authority: "",
	minter: "",
})

onMounted(() => {
	if (authStore.bitsongAddress) {
		dataForm.authority = authStore.bitsongAddress
		dataForm.minter = authStore.bitsongAddress
	}
})

const onSubmit = async () => {
	try {
		const denom = await fantokenStore.issueFantoken(dataForm)

		onDialogOK()

		quasar.notify({
			message: `Fantoken created with denom: ${denom}`,
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
					<div class="q-col-gutter-md row q-mb-lg">
						<q-input
							class="col-12"
							label="Name"
							dense
							filled
							v-model="dataForm.name"
							:rules="[(val) => (!!val && val.length > 0) || 'Name field is required']"
							hint="Your fantoken name"
						/>
						<q-input
							class="col-12"
							label="Symbol"
							dense
							filled
							v-model="dataForm.symbol"
							:rules="[
								(val) => (!!val && val.length > 0) || 'Symbol field is required',
							]"
							hint="Your fantoken symbol"
						/>
						<q-input
							class="col-12"
							label="Uri"
							dense
							filled
							v-model="dataForm.uri"
							hint="Your fantoken uri (optional)"
						/>
						<q-input
							class="col-12"
							label="Max Supply"
							dense
							filled
							v-model.number="dataForm.maxSupply"
							:suffix="dataForm.symbol"
							type="number"
							:rules="[(val) => !!val || 'Max Supply field is required']"
						/>
						<q-input
							class="col-12"
							label="Authority"
							dense
							filled
							v-model="dataForm.authority"
							hint="Address of fantoken authority"
							:rules="[
								(val) => !!val || 'Authority field is required',
								(val) =>
									isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
									'Invalid address',
							]"
						/>
						<q-input
							class="col-12"
							label="Minter"
							dense
							filled
							v-model="dataForm.minter"
							hint="Address of fantoken minter"
							:rules="[
								(val) => !!val || 'Minter field is required',
								(val) =>
									isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
									'Invalid address',
							]"
						/>

						<p class="col-12" v-if="fantokenStore.issueFee">
							<span class="text-bold">Issue fee:</span>
							{{ fantokenStore.issueFee.amount }}
							<span class="text-uppercase">{{ fantokenStore.issueFee.denom }}</span>
						</p>
					</div>
				</q-card-section>
				<q-card-actions align="right">
					<q-btn color="primary" label="Issue" type="submit" />
					<q-btn color="secondary" label="Cancel" @click="onDialogCancel" />
				</q-card-actions>
			</q-form>
		</q-card>
	</q-dialog>
</template>
