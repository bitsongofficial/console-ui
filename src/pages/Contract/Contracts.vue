<script setup lang="ts">
import { isValidAddress } from "@/common"
import { bitsongChain } from "@/configs"
import { TableColumn } from "@/models"
import useAuth from "@/store/auth"
import useCosmWasm from "@/store/cosmwasm"
import { onMounted, onUnmounted, ref, watch } from "vue"
import { useRouter } from "vue-router"

const authStore = useAuth()
const cosmWasmStore = useCosmWasm()
const router = useRouter()

const contractAddress = ref("")

const goToContract = async (address: string) => {
	await router.push(`/contract/${address}`)
}

const search = async () => {
	if (
		bitsongChain &&
		isValidAddress(contractAddress.value, bitsongChain.bech32_prefix, 32)
	) {
		await goToContract(contractAddress.value)
	}
}

const expandRow = (props: any, codeId: number) => {
	props.expand = !props.expand
	cosmWasmStore.getContracts(codeId)
}

onMounted(() => {
	cosmWasmStore.getCodes()
})

const columns: TableColumn[] = [
	{
		name: "id",
		required: true,
		label: "Code ID",
		align: "left",
		field: "id",
		sortable: true,
	},
	{
		name: "creator",
		required: true,
		label: "Creator",
		align: "left",
		field: "creator",
		sortable: true,
	},
	{
		name: "actions",
		required: true,
		label: "",
		align: "right",
		field: "actions",
	},
]

const pagination = {
	sortBy: "id",
	descending: true,
	rowsPerPage: 15,
}
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Contracts</h4>
					</div>
					<div class="col-auto">
						<q-btn
							color="primary"
							label="Upload"
							no-caps
							class="q-mr-sm"
							to="/contracts/upload"
						/>
					</div>
				</div>
			</div>

			<q-input
				class="q-mb-lg"
				dense
				outlined
				label="Contract Address"
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
				@keydown.enter="search"
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

			<q-table
				:columns="columns"
				:rows="cosmWasmStore.codes"
				:loading="cosmWasmStore.loadingCodes"
				:pagination="pagination"
			>
				<template v-slot:body-cell-id="props">
					<q-td :props="props">
						<router-link class="text-primary" :to="`/contracts/code/${props.row.id}`">
							{{ props.row.id }}
						</router-link>
					</q-td>
				</template>
				<template v-slot:body-cell-actions="props">
					<q-td :props="props">
						<q-btn
							size="sm"
							color="primary"
							round
							dense
							icon="chevron_right"
							:to="`/contracts/code/${props.row.id}`"
						/>
					</q-td>
				</template>
			</q-table>
		</div>
	</q-page>
</template>
