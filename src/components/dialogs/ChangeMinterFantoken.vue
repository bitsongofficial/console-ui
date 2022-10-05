<script lang="ts" setup>
import { IssueFantoken } from "@/models"
import { useDialogPluginComponent, useQuasar } from "quasar"
import { reactive } from "vue"
import { FanToken } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/fantoken"
import { isValidAddress } from "@/common"
import { bitsongChain } from "@/configs"
import useFantoken from "@/store/fantoken"

const props = defineProps<{
	fantoken: FanToken
}>()

const fantokenStore = useFantoken()
const quasar = useQuasar()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
	useDialogPluginComponent()

const dataForm = reactive<Partial<IssueFantoken>>({
	minter: "",
})

const onSubmit = async () => {
	try {
		await fantokenStore.setMinterFantoken(dataForm, props.fantoken)

		onDialogOK()

		quasar.notify({
			message: `Fantoken ${props.fantoken.metaData?.name} minter changed`,
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
					<p class="text-bold text-h6">
						Change Minter {{ fantoken.metaData?.name }}
					</p>
					<div class="q-col-gutter-md row q-mb-lg">
						<q-input
							class="col-12"
							label="Minter"
							dense
							filled
							v-model="dataForm.minter"
							hint="Address of fantoken minter"
							:rules="[
								(val) => !!val || 'Authority field is required',
								(val) =>
									isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
									'Invalid address',
							]"
						/>
					</div>
				</q-card-section>
				<q-card-actions align="right">
					<q-btn color="secondary" label="Cancel" @click="onDialogCancel" />
					<q-btn
						color="primary"
						label="Save"
						type="submit"
						:loading="fantokenStore.changingMinter"
					/>
				</q-card-actions>
			</q-form>
		</q-card>
	</q-dialog>
</template>
