<script setup lang="ts">
import { isValidAddress } from "@/common"
import { bitsongChain } from "@/configs"
import useAuth from "@/store/auth"
import useCosmWasm from "@/store/cosmwasm"
import { onUnmounted, ref, watch } from "vue"

const authStore = useAuth()
const cosmWasmStore = useCosmWasm()

const contractAddress = ref("")

const contractAddressWatcher = watch(
	() => contractAddress.value,
	(value) => {
		if (bitsongChain && isValidAddress(value, bitsongChain.bech32_prefix, 32)) {
			cosmWasmStore.getContract(contractAddress.value)
		}
	}
)

onUnmounted(() => {
	contractAddressWatcher()
})
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Contract</h4>
					</div>
					<div class="col-auto">
						<q-btn
							color="primary"
							label="Upload"
							no-caps
							class="q-mr-sm"
							to="/contracts/upload"
						/>

						<q-btn
							color="primary"
							label="Instantiate"
							no-caps
							to="/contracts/instantiate"
						/>
					</div>
				</div>
			</div>

			<q-input
				class="col-12 q-mb-lg"
				dense
				outlined
				v-model="contractAddress"
				:rules="[
					(val) => !!val || 'Required',
					(val) =>
						isValidAddress(val, bitsongChain?.bech32_prefix ?? '', 32) ||
						'Invalid address',
				]"
				debounce="500"
				:loading="cosmWasmStore.loadingContract"
				:disable="!authStore.session"
			>
				<template v-slot:append>
					<q-icon
						v-if="contractAddress !== ''"
						name="close"
						@click="contractAddress = ''"
						class="cursor-pointer"
					/>
					<q-icon name="search" v-else />
				</template>
			</q-input>

			<q-card class="q-mb-lg" bordered>
				<template v-if="!cosmWasmStore.loadingContract && !cosmWasmStore.contract">
					<q-card-section>
						<pre>Search by contract address</pre>
					</q-card-section>
				</template>
				<template v-else-if="cosmWasmStore.contract">
					<q-card-section class="row">
						<q-btn
							color="secondary"
							label="Query"
							no-caps
							class="q-ml-auto q-mr-sm"
							:to="`/contract/query/${cosmWasmStore.contract.address}`"
						/>

						<q-btn
							color="secondary"
							label="Execute"
							no-caps
							:to="`/contract/execute/${cosmWasmStore.contract.address}`"
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
