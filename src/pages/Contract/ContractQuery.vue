<script setup lang="ts">
import { onMounted, ref } from "vue"
import { isValidJSON, isValidAddress } from "@/common"
import { bitsongChain } from "@/configs"
import { useRoute, useRouter } from "vue-router"
import useCosmWasm from "@/store/cosmwasm"
import useAuth from "@/store/auth"

const cosmWasmStore = useCosmWasm()
const authStore = useAuth()
const route = useRoute()
const router = useRouter()

const contract = route.params.contract as string

onMounted(async () => {
	if (
		!bitsongChain ||
		!isValidAddress(contract, bitsongChain?.bech32_prefix, 32)
	) {
		await router.replace("/contract")
	}
})

const queryMsg = ref("")
const queryOutput = ref("")

const submit = async () => {
	try {
		queryOutput.value = await cosmWasmStore.queryContractSmart(
			contract,
			queryMsg.value
		)

		console.log(queryOutput.value)

		/* reset() */
	} catch (error) {
		queryOutput.value = `Something went wrong: ${(error as Error).message}`
	}
}

const reset = () => {
	queryMsg.value = ""
}
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Query</h4>
					</div>
				</div>
			</div>

			<q-form @submit="submit" @reset="reset">
				<q-card class="q-pa-lg q-mb-lg" bordered>
					<div class="q-col-gutter-md row">
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
							<q-card bordered>
								<q-card-section>
									<pre v-if="isValidJSON(queryOutput)">{{ queryOutput }}</pre>
									<p v-else>{{ queryOutput }}</p>
								</q-card-section>
							</q-card>
						</div>

						<div class="col-12 flex justify-end">
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
	</q-page>
</template>
