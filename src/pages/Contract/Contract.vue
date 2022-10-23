<script setup lang="ts">
import { isValidAddress } from "@/common"
import { bitsongChain } from "@/configs"
import { ref } from "vue"

const contractAddress = ref("")
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
							to="/contract/upload"
						/>

						<q-btn
							color="primary"
							label="Instantiate"
							no-caps
							to="/contract/instantiate"
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
						isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
						'Invalid address',
				]"
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

			<q-card class="q-pa-lg q-mb-lg" bordered>
				<q-card-section>
					<pre>Search by contract address</pre>
				</q-card-section>
			</q-card>
		</div>
	</q-page>
</template>
