<script setup lang="ts">
import { TableColumn } from "@/models"
import { Coin } from "@cosmjs/proto-signing"
import { useQuasar } from "quasar"
import useBank from "@/store/bank"
import { TransferToOsmosis, SendFantoken } from "@/components"
import useOsmosis from "@/store/osmosis"

const quasar = useQuasar()
const bankStore = useBank()
const osmosisStore = useOsmosis()

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
	{
		name: "actions",
		required: true,
		label: "",
		align: "right",
		field: "actions",
	},
]

const pagination = {
	sortBy: "amount",
	descending: true,
	rowsPerPage: 30,
}

const openTransferDialog = (coin: Coin) => {
	quasar
		.dialog({
			component: TransferToOsmosis,
			componentProps: {
				balance: coin,
			},
		})
		.onOk(() => {
			bankStore.loadBalance()
			osmosisStore.loadBalances()
		})
}

const openSendDialog = (coin: Coin) => {
	quasar
		.dialog({
			component: SendFantoken,
			componentProps: {
				balance: coin,
			},
		})
		.onOk(() => {
			bankStore.loadBalance()
		})
}
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Balances</h4>
					</div>
				</div>
			</div>

			<q-table
				:rows="bankStore.balances"
				:loading="bankStore.loading"
				:columns="columns"
				:pagination="pagination"
				row-key="denom"
				flat
				bordered
			>
				<template v-slot:body-cell-actions="actionsProps">
					<q-td :props="actionsProps">
						<q-btn flat unelevated :ripple="false">
							<q-icon name="more_vert"></q-icon>

							<q-menu>
								<q-list style="min-width: 140px">
									<q-item
										clickable
										v-close-popup
										@click="openSendDialog(actionsProps.row)"
									>
										<q-item-section>Send</q-item-section>
									</q-item>
									<q-item
										clickable
										v-close-popup
										@click="openTransferDialog(actionsProps.row)"
									>
										<q-item-section>Transfer to Osmosis</q-item-section>
									</q-item>
								</q-list>
							</q-menu>
						</q-btn>
					</q-td>
				</template>
			</q-table>
		</div>
	</q-page>
</template>
