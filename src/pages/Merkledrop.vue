<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue"
import { MerkledropForm } from "@/models"
import { Account, Merkledrop } from "@bitsongjs/utils"
import { btsgAssets } from "@/configs"
import { BigNumber } from "bignumber.js"
import useMerkledrop from "@/store/merkledrop"
import useChain from "@/store/chain"
import { fromBaseToDisplay } from "@/utils"
import { exportFile, useQuasar } from "quasar"

const merkledropStore = useMerkledrop()
const chainStore = useChain()
const quasar = useQuasar()

const merkledropForm = reactive<MerkledropForm>({
	startHeight: 0,
	endHeight: 0,
	accountsFile: undefined,
	coin: 0,
	merkleRoot: "",
	asset: undefined,
})

const merkledrop = ref<Merkledrop>()

const onSubmit = () => {
	//snapshotStore.loadDelegators(snapshotForm)
}

const onReset = () => {
	merkledropForm.startHeight = 0
	merkledropForm.endHeight = 0
	merkledropForm.accountsFile = undefined
	merkledropForm.coin = 0
	merkledropForm.merkleRoot = ""
	merkledropForm.asset = undefined
}

const onFileChange = async () => {
	if (merkledropForm.accountsFile && merkledropForm.asset) {
		try {
			const accounts: Account[] = JSON.parse(
				await merkledropForm.accountsFile.text()
			)

			merkledrop.value = new Merkledrop(accounts)

			merkledropForm.merkleRoot = merkledrop.value.getMerkleRoot()

			const totalAmount = accounts
				.map((account) => account.amount)
				.reduce((prev, curr) => {
					return new BigNumber(prev).plus(curr)
				}, new BigNumber(0))

			const totalAmountCoin = fromBaseToDisplay(
				{
					$type: "cosmos.base.v1beta1.Coin",
					amount: totalAmount.toString(),
					denom: merkledropForm.asset.base,
				},
				merkledropForm.asset
			)

			merkledropForm.coin = parseInt(totalAmountCoin.amount)
		} catch (error) {
			console.error(error)
		}
	}
}

const exportJsonAccounts = () => {
	if (merkledrop.value) {
		const status = exportFile(
			"accounts-proofs.json",
			JSON.stringify(merkledrop.value.getAccountsWithProofs()),
			"application/json"
		)

		if (status !== true) {
			quasar.notify({
				message: "Browser denied file download...",
				color: "negative",
				icon: "warning",
			})
		}
	}
}

onMounted(() => {
	setTimeout(() => {
		merkledropStore.loadParams()
	}, 500)
})
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="col-auto">
			<div class="row">
				<div class="col">
					<h4 class="q-mb-lg q-mt-none text-bold">Merkledrop</h4>
				</div>
			</div>
		</div>

		<div class="col-auto">
			<q-form
				@submit="onSubmit"
				class="q-col-gutter-md row q-mb-lg"
				@reset="onReset"
			>
				<q-select
					class="col-12 col-md-4 col-lg-3"
					label="Asset *"
					dense
					filled
					v-model="merkledropForm.asset"
					:options="btsgAssets?.assets ?? []"
					option-label="description"
					option-value="base"
					:rules="[(val) => !!val || '* Required']"
					@update:model-value="onFileChange"
				/>
				<q-input
					class="col-12 col-md-4 col-lg-3"
					label="Start Height *"
					dense
					filled
					v-model.number="merkledropForm.startHeight"
					:loading="chainStore.loadingBlock"
					type="number"
					:rules="[
						(val) =>
							val >= chainStore.latestHeight ||
							`Please use a value greater then zero ${chainStore.latestHeight}`,
					]"
				/>

				<q-input
					class="col-12 col-md-4 col-lg-3"
					label="End Height *"
					dense
					filled
					v-model.number="merkledropForm.endHeight"
					:loading="chainStore.loadingBlock"
					type="number"
					:rules="[
						(val) =>
							val >= chainStore.latestHeight ||
							`Please use a value greater then zero ${chainStore.latestHeight}`,
					]"
				/>

				<q-file
					class="col-12 col-md-4 col-lg-3"
					label="Accounts file *"
					dense
					filled
					v-model="merkledropForm.accountsFile"
					accept=".json, application/json"
					@update:model-value="onFileChange"
					:rules="[(val) => !!val || '* Required']"
					:readonly="!merkledropForm.asset"
				>
					<template v-slot:prepend>
						<q-icon name="attach_file" />
					</template>
				</q-file>

				<q-input
					class="col-12 col-md-4 col-lg-3"
					label="Merkle Root *"
					dense
					filled
					v-model="merkledropForm.merkleRoot"
					readonly
					:rules="[(val) => !!val || '* Required']"
				/>

				<q-input
					class="col-12 col-md-4 col-lg-3"
					label="Total amount *"
					dense
					filled
					v-model="merkledropForm.coin"
					readonly
					:rules="[(val) => !!val || '* Required']"
					:suffix="merkledropForm.asset?.symbol ?? ''"
				/>

				<p class="col-12" v-if="merkledropStore.creationFee">
					<span class="text-bold">Creation fee:</span>
					{{ merkledropStore.creationFee.amount }}
					<span class="text-uppercase">{{ merkledropStore.creationFee.denom }}</span>
				</p>

				<div class="col-12 flex justify-end">
					<q-btn type="submit" color="primary">
						<q-icon name="send" />
					</q-btn>
					<q-btn type="reset" class="q-ml-sm" color="secondary" label="reset" />
				</div>
			</q-form>

			<q-card v-if="merkledrop">
				<q-card-actions>
					<q-btn
						color="primary"
						icon-right="archive"
						label="Export to JSON"
						class="q-ml-auto"
						no-caps
						@click="exportJsonAccounts"
					/>
				</q-card-actions>
				<q-card-section>
					<pre>{{ merkledrop.getAccountsWithProofs() }}</pre>
				</q-card-section>
			</q-card>
		</div>
	</q-page>
</template>
