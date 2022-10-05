<script lang="ts" setup>
import { IssueFantoken } from "@/models"
import { useDialogPluginComponent, useQuasar } from "quasar"
import { reactive } from "vue"
import { FanToken } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/fantoken"
import useFantoken from "@/store/fantoken"

const props = defineProps<{
	fantoken: FanToken
}>()

const fantokenStore = useFantoken()
const quasar = useQuasar()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
	useDialogPluginComponent()

const dataForm = reactive<Partial<IssueFantoken>>({
	uri: "",
})

const onSubmit = async () => {
	try {
		await fantokenStore.setUriFantoken(dataForm, props.fantoken)

		onDialogOK()

		quasar.notify({
			message: `Fantoken ${props.fantoken.metaData?.name} uri changed`,
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
					<p class="text-bold text-h6">Change URI {{ fantoken.metaData?.name }}</p>
					<div class="q-col-gutter-md row q-mb-lg">
						<q-input
							class="col-12"
							label="URI"
							dense
							filled
							v-model="dataForm.uri"
							hint="Your fantoken uri"
							:rules="[(val) => !!val || 'URI field is required']"
						/>
					</div>
				</q-card-section>
				<q-card-actions align="right">
					<q-btn color="secondary" label="Cancel" @click="onDialogCancel" />
					<q-btn
						color="primary"
						label="Save"
						type="submit"
						:loading="fantokenStore.changingUri"
					/>
				</q-card-actions>
			</q-form>
		</q-card>
	</q-dialog>
</template>
