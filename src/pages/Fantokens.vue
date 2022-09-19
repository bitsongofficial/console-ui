<script lang="ts" setup>
import { btsgAssets, btsgStakingCoin } from "@/configs"
import { TableColumn } from "@/models"
import { FanToken } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/fantoken"
import { onMounted } from "vue"
import { fromBaseToDisplay } from "@/utils"
import { Coin } from "@bitsongjs/client/dist/codec/cosmos/base/v1beta1/coin"
import useAuth from "@/store/auth"
import useFantoken from "@/store/fantoken"

const fantokenStore = useFantoken()
const authStore = useAuth()

const columns: TableColumn[] = [
	{
		name: "name",
		required: true,
		label: "Name",
		align: "left",
		field: (row: FanToken) => row.metaData?.name ?? "",
	},
	{
		name: "symbol",
		required: true,
		label: "Symbol",
		align: "left",
		field: (row: FanToken) => (row.metaData?.symbol ?? "").toUpperCase(),
	},
	{
		name: "maxSupply",
		required: true,
		label: "Max Supply",
		align: "left",
		field: (row: FanToken) => row.maxSupply,
		format: (maxSupply: string, row: FanToken) => {
			if (btsgAssets) {
				let asset = btsgAssets.assets.find((el) => el.base === row.denom)

				if (!asset && btsgStakingCoin) {
					asset = btsgStakingCoin
				}

				if (asset) {
					const newCoin = fromBaseToDisplay(
						{
							$type: Coin.$type,
							amount: maxSupply,
							denom: row.denom,
						},
						asset
					)

					return `${newCoin.amount} ${newCoin.denom.toUpperCase()}`
				}
			}

			return `${maxSupply} ${row.metaData?.symbol.toUpperCase()}`
		},
	},
]

const pagination = {
	sortBy: "tokens",
	descending: false,
	rowsPerPage: 20,
}

onMounted(() => {
	fantokenStore.loadFantokens()
})
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="col-auto">
			<div class="row">
				<div class="col">
					<h4 class="q-mb-lg q-mt-none text-bold">Fantokens</h4>
				</div>
			</div>
		</div>

		<div class="col-auto">
			<q-table
				:rows="fantokenStore.fantokens"
				:loading="fantokenStore.loading"
				:columns="columns"
				:pagination="pagination"
				row-key="address"
			>
				<template v-slot:top-right> </template>
			</q-table>
		</div>
	</q-page>
</template>
