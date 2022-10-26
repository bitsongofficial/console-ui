<script setup lang="ts">
import { isValidAddress } from "@/common"
import { bitsongChain } from "@/configs"
import useAuth from "@/store/auth"
import useCosmWasm from "@/store/cosmwasm"
import { onMounted, onUnmounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

const authStore = useAuth()
const cosmWasmStore = useCosmWasm()
const router = useRouter()
const route = useRoute()

const contract = route.params.contract as string

onMounted(async () => {
	if (
		!bitsongChain ||
		!isValidAddress(contract, bitsongChain?.bech32_prefix, 32)
	) {
		await router.replace("/contracts")
	} else {
		cosmWasmStore.getContract(contract)
	}
})
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<q-btn
					icon="arrow_back"
					size="md"
					class="q-mb-md"
					color="primary"
					label="Back"
					no-caps
					@click="router.back()"
					unelevated
					flat
				/>
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Contract</h4>
					</div>
				</div>
			</div>

			<q-card class="q-mb-lg" bordered>
				<template v-if="!cosmWasmStore.loadingContract && !cosmWasmStore.contract">
					<q-card-section>
						<pre>Please use a valid address</pre>
					</q-card-section>
				</template>
				<template v-else-if="cosmWasmStore.contract">
					<q-card-section class="row">
						<p class="q-mb-none flex items-center">
							{{ cosmWasmStore.contract.address }}
						</p>
						<q-btn
							color="secondary"
							label="Interact (Query/Execute)"
							no-caps
							class="q-ml-auto"
							:to="`/contract/${cosmWasmStore.contract.address}/interact`"
						/>
					</q-card-section>
					<q-separator />
					<q-card-section>
						<p class="text-bold">Code ID</p>
						<p>{{ cosmWasmStore.contract.codeId }}</p>
						<p class="text-bold">Creator</p>
						<p>{{ cosmWasmStore.contract.creator }}</p>
					</q-card-section>

					<q-card-section v-if="cosmWasmStore.contractHistory.length > 0">
						<template v-for="history of cosmWasmStore.contractHistory">
							<p>{{ history.operation }}Msg</p>
							<pre class="q-pa-md border-1 border-gray border-solid rounded-borders">{{
								history.msg
							}}</pre>
						</template>
					</q-card-section>
				</template>
			</q-card>
		</div>
	</q-page>
</template>
