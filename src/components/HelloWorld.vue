<script setup lang="ts">
import { onMounted, ref } from "vue"

import { BitsongClient } from "@bitsongjs/client"
import { QueryClientImpl } from "@bitsongjs/client/dist/codec/cosmos/staking/v1beta1/query"
import { BigNumber } from "bignumber.js"
import Long from "long"

onMounted(async () => {
	const api = await BitsongClient.connect({
		connection: {
			type: "tendermint",
			endpoints: ["https://rpc.explorebitsong.com"],
		},
	})

	const stakingClient = new QueryClientImpl(api.queryClient)

	const response = await stakingClient.Validators({
		$type: "cosmos.staking.v1beta1.QueryValidatorsRequest",
		status: "BOND_STATUS_BONDED",
		pagination: {
			$type: "cosmos.base.query.v1beta1.PageRequest",
			key: new Uint8Array([]),
			limit: Long.fromNumber(9999),
			countTotal: true,
			reverse: false,
			offset: Long.fromNumber(0),
		},
	})

	const validators = response.validators.sort(
		(a, b) =>
			new BigNumber(b.tokens).toNumber() - new BigNumber(a.tokens).toNumber()
	)

	const responseDelegations = await stakingClient.ValidatorDelegations({
		$type: "cosmos.staking.v1beta1.QueryValidatorDelegationsRequest",
		validatorAddr: validators[0].operatorAddress,
		pagination: {
			$type: "cosmos.base.query.v1beta1.PageRequest",
			key: new Uint8Array([]),
			limit: Long.fromNumber(9999),
			countTotal: true,
			reverse: false,
			offset: Long.fromNumber(0),
		},
	})

	console.log(responseDelegations)

	console.log(response)
})

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
	<h1>{{ msg }}</h1>

	<div class="card">
		<button type="button" @click="count++">count is {{ count }}</button>
		<p>
			Edit
			<code>components/HelloWorld.vue</code> to test HMR
		</p>
	</div>

	<p>
		Check out
		<a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
			>create-vue</a
		>, the official Vue + Vite starter
	</p>
	<p>
		Install
		<a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
		in your IDE for a better DX
	</p>
	<p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
	color: #888;
}
</style>
