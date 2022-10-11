<script lang="ts" setup>
import { btsgAssets, btsgStakingCoin } from "@/configs"
import { TableColumn } from "@/models"
import { FanToken } from "@bitsongjs/client/dist/codec/bitsong/fantoken/v1beta1/fantoken"
import { onMounted } from "vue"
import { fromBaseToDisplay } from "@/utils"
import { useVueFuse } from "vue-fuse"
import { useQuasar } from "quasar"
import {
	IssueFantoken,
	MintFantoken,
	BurnFantoken,
	ChangeUriFantoken,
	ChangeAuthorityFantoken,
	ChangeMinterFantoken,
} from "@/components"
import useAuth from "@/store/auth"
import useFantoken from "@/store/fantoken"
import useBank from "@/store/bank"
import { formatShortAddress, formatShortText } from "@/common"

const fantokenStore = useFantoken()
const authStore = useAuth()
const bankStore = useBank()
const quasar = useQuasar()

const { search, runSearch, results, noResults } = useVueFuse(
	fantokenStore.sortedFantokens,
	{
		keys: ["metaData.name", "metaData.symbol", "minter"],
	}
)

const columns: TableColumn[] = [
	{
		name: "name",
		required: true,
		label: "Name",
		align: "left",
		field: (row: FanToken) => row.metaData?.name ?? "",
	},
	{
		name: "denom",
		required: true,
		label: "Denom",
		align: "left",
		field: (row: FanToken) => formatShortText(row.denom, 3),
	},
	{
		name: "symbol",
		required: true,
		label: "Symbol",
		align: "left",
		field: (row: FanToken) => (row.metaData?.symbol ?? "").toUpperCase(),
	},
	{
		name: "minter",
		required: true,
		label: "Minter",
		align: "left",
		field: (row: FanToken) => formatShortAddress(row.minter),
	},
	{
		name: "authority",
		required: true,
		label: "Authority",
		align: "left",
		field: (row: FanToken) => formatShortAddress(row.metaData?.authority ?? ""),
	},
	{
		name: "uri",
		required: true,
		label: "URI",
		align: "left",
		field: (row: FanToken) => formatShortText(row.metaData?.uri ?? ""),
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
							amount: maxSupply,
							denom: row.denom,
						},
						asset
					)

					return `${newCoin.amount} ${row.metaData?.symbol.toUpperCase()}`
				}
			}

			return `${maxSupply} ${row.metaData?.symbol.toUpperCase()}`
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
	sortBy: "tokens",
	descending: false,
	rowsPerPage: 20,
}

onMounted(() => {
	fantokenStore.loadFantokens()
	fantokenStore.loadParams()
})

const onSearchText = (value: string | number | null) => {
	if (value) {
		search.value = `${value}`
		runSearch(search.value)
	}
}

const openCreateDialog = () => {
	quasar
		.dialog({
			component: IssueFantoken,
		})
		.onOk(() => {
			fantokenStore.loadFantokens()
		})
}

const openMintDialog = (fantoken: FanToken) => {
	quasar
		.dialog({
			component: MintFantoken,
			componentProps: {
				fantoken,
			},
		})
		.onOk(() => {
			bankStore.loadBalance()
		})
}

const openBurnDialog = (fantoken: FanToken) => {
	quasar
		.dialog({
			component: BurnFantoken,
			componentProps: {
				fantoken,
			},
		})
		.onOk(() => {
			bankStore.loadBalance()
		})
}

const openChangeUriDialog = (fantoken: FanToken) => {
	quasar
		.dialog({
			component: ChangeUriFantoken,
			componentProps: {
				fantoken,
			},
		})
		.onOk(() => {
			fantokenStore.loadFantokens()
		})
}

const openChangeAuthorityDialog = (fantoken: FanToken) => {
	quasar
		.dialog({
			component: ChangeAuthorityFantoken,
			componentProps: {
				fantoken,
			},
		})
		.onOk(() => {
			fantokenStore.loadFantokens()
		})
}

const openChangeMinterDialog = (fantoken: FanToken) => {
	quasar
		.dialog({
			component: ChangeMinterFantoken,
			componentProps: {
				fantoken,
			},
		})
		.onOk(() => {
			fantokenStore.loadFantokens()
		})
}

const openDisableMintDialog = (fantoken: FanToken) => {
	quasar
		.dialog({
			title: "Disable Mint",
			message:
				"Are you sure you want to disable mint? This operation is not reversible",
			ok: {
				color: "primary",
			},
			cancel: {
				color: "secondary",
			},
		})
		.onOk(async () => {
			try {
				await fantokenStore.disableMint(fantoken)

				quasar.notify({
					message: `Minting disabled for ${fantoken.metaData?.name}`,
					color: "positive",
					icon: "warning",
					closeBtn: true,
					timeout: 10000,
				})
			} catch (error) {
				console.error(error)

				quasar.notify({
					message: `Something went wrong: ${(error as Error).message}`,
					color: "negative",
					icon: "warning",
					closeBtn: true,
					timeout: 10000,
				})
			}
		})
}
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Fantokens</h4>
					</div>
				</div>
			</div>

			<div class="col-auto">
				<q-table
					:rows="
						noResults || search.length === 0 ? fantokenStore.sortedFantokens : results
					"
					:loading="fantokenStore.loading"
					:columns="columns"
					:pagination="pagination"
					row-key="address"
				>
					<template v-slot:top-right>
						<q-input
							label="Search"
							dense
							filled
							v-model="search"
							@update:model-value="onSearchText"
						/>

						<q-btn
							class="q-ml-md"
							color="primary"
							no-caps
							round
							rounded
							:disable="!authStore.session"
							@click="openCreateDialog"
						>
							<q-icon name="add"></q-icon>
						</q-btn>
					</template>
					<template v-slot:body-cell-actions="actionsProps">
						<q-td :props="actionsProps">
							<q-btn
								flat
								unelevated
								:ripple="false"
								v-if="
									actionsProps.row.minter === authStore.bitsongAddress ||
									actionsProps.row.metaData.authority === authStore.bitsongAddress
								"
							>
								<q-icon name="more_vert"></q-icon>

								<q-menu>
									<q-list style="min-width: 140px">
										<q-item
											clickable
											v-close-popup
											@click="openMintDialog(actionsProps.row)"
											v-if="actionsProps.row.minter === authStore.bitsongAddress"
										>
											<q-item-section>Mint</q-item-section>
										</q-item>
										<q-item
											clickable
											v-close-popup
											@click="openBurnDialog(actionsProps.row)"
										>
											<q-item-section>Burn</q-item-section>
										</q-item>
										<q-item
											clickable
											v-close-popup
											@click="openDisableMintDialog(actionsProps.row)"
											v-if="actionsProps.row.minter === authStore.bitsongAddress"
										>
											<q-item-section>Disable Mint</q-item-section>
										</q-item>
										<q-item
											clickable
											v-close-popup
											@click="openChangeUriDialog(actionsProps.row)"
											v-if="
												actionsProps.row.metaData.authority === authStore.bitsongAddress
											"
										>
											<q-item-section>Change URI</q-item-section>
										</q-item>
										<q-item
											clickable
											v-close-popup
											@click="openChangeAuthorityDialog(actionsProps.row)"
											v-if="
												actionsProps.row.metaData.authority === authStore.bitsongAddress
											"
										>
											<q-item-section>Change Authority</q-item-section>
										</q-item>
										<q-item
											clickable
											v-close-popup
											@click="openChangeMinterDialog(actionsProps.row)"
											v-if="actionsProps.row.minter === authStore.bitsongAddress"
										>
											<q-item-section>Change Minter</q-item-section>
										</q-item>
									</q-list>
								</q-menu>
							</q-btn>
						</q-td>
					</template>
				</q-table>
			</div>
		</div>
	</q-page>
</template>
