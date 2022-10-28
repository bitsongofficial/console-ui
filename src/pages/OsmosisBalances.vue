<script setup lang="ts">
import { TableColumn } from "@/models"
import useOsmosis from "@/store/osmosis"
import { Coin } from "@cosmjs/proto-signing"
import { onMounted } from "vue"

const osmosisStore = useOsmosis()

onMounted(() => {
	osmosisStore.loadBalances()
})

const columns: TableColumn[] = [
	{
		name: "denom",
		required: true,
		label: "Denom",
		align: "left",
		field: (row: Coin) => row.denom.toUpperCase(),
	},
	{
		name: "amount",
		required: true,
		label: "Amount",
		align: "left",
		field: (row: Coin) => row.amount,
		sortable: true,
		sort: (a, b) => {
			return parseFloat(a) - parseFloat(b)
		},
	},
]

const pagination = {
	sortBy: "amount",
	descending: true,
	rowsPerPage: 30,
}
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Osmosis Balances</h4>
					</div>
				</div>
			</div>

			<q-table
				:rows="osmosisStore.balances"
				:loading="osmosisStore.loadingBalances"
				:columns="columns"
				:pagination="pagination"
				row-key="denom"
				flat
				bordered
			/>
		</div>
	</q-page>
</template>
