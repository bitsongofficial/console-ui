<script setup lang="ts">
import useCosmWasm from "@/store/cosmwasm"
import useAuth from "@/store/auth"
import { useQuasar } from "quasar"
import { ref } from "vue"
import { useRouter } from "vue-router"

const cosmWasmStore = useCosmWasm()
const authStore = useAuth()
const quasar = useQuasar()
const router = useRouter()
const contractWasm = ref<File>()

const submit = async () => {
	try {
		if (contractWasm.value) {
			const arrayBuffer = await contractWasm.value.arrayBuffer()
			const byteFile = new Uint8Array(arrayBuffer)

			const result = await cosmWasmStore.uploadContract(byteFile)

			reset()

			quasar.notify({
				message: `New contract uploaded with ID: ${result?.codeId}`,
				color: "positive",
				icon: "warning",
				closeBtn: true,
				timeout: 10000,
			})

			await router.push(`/contracts/code/${result?.codeId}`)
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

const reset = () => {
	contractWasm.value = undefined
}
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Upload a wasm file</h4>
					</div>
				</div>
			</div>

			<q-form class="row" @submit="submit" @reset="reset">
				<q-card class="col-12 col-md-6 q-pa-lg q-mb-lg q-mx-auto" bordered>
					<q-file
						v-model="contractWasm"
						label="Upload a wasm file"
						dense
						filled
						:rules="[(val) => !!val || 'Required']"
					>
						<template v-slot:append>
							<q-icon name="attachment" />
						</template>
					</q-file>

					<q-btn
						class="full-width q-mt-sm"
						type="submit"
						label="Upload"
						color="primary"
						:disable="!authStore.session"
						:loading="cosmWasmStore.uploading"
					/>
				</q-card>
			</q-form>
		</div>
	</q-page>
</template>
