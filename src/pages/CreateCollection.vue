<script setup lang="ts">
import { isValidAddress } from "@/common"
import { bitsongChain } from "@/configs"
import { MsgCreateCollection } from "@bitsongjs/client/dist/codec/bitsong/nft/v1beta1/tx"
import { useQuasar } from "quasar"
import { reactive } from "vue"
import useAuth from "@/store/auth"
import useNFT from "@/store/nft"

const quasar = useQuasar()
const authStore = useAuth()
const nftStore = useNFT()

const dataForm = reactive<Partial<MsgCreateCollection>>({
	name: "",
	symbol: "",
	uri: "",
	isMutable: true,
	updateAuthority: "",
})

const onSubmit = async () => {
	console.log(dataForm)
	try {
		await nftStore.createCollection({
			...dataForm,
		})

		onReset()

		quasar.notify({
			message: "New collection created",
			color: "positive",
			icon: "warning",
			closeBtn: true,
			timeout: 10000,
		})
	} catch (error) {
		quasar.notify({
			message: `Something went wrong: ${(error as Error).message}`,
			color: "negative",
			icon: "warning",
			closeBtn: true,
			timeout: 10000,
		})
	}
}

const onReset = () => {
	dataForm.name = ""
	dataForm.symbol = ""
	dataForm.uri = ""
	dataForm.isMutable = true
	dataForm.updateAuthority = ""
}
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Create Collection</h4>
					</div>
				</div>
			</div>

			<q-card class="q-pa-lg q-mb-lg" bordered>
				<q-form @submit="onSubmit" class="q-col-gutter-md row" @reset="onReset">
					<q-input
						class="col-12 col-md-6"
						label="Name"
						dense
						filled
						v-model="dataForm.name"
						:rules="[(val) => !!val || 'Required']"
					/>

					<q-input
						class="col-12 col-md-6"
						label="Symbol"
						dense
						filled
						v-model="dataForm.symbol"
						:rules="[(val) => !!val || 'Required']"
					/>

					<q-input
						class="col-12 col-md-6"
						label="URI"
						dense
						filled
						v-model="dataForm.uri"
						:rules="[(val) => !!val || 'Required']"
					/>

					<q-input
						class="col-12 col-md-6"
						label="Update Authority"
						dense
						filled
						v-model="dataForm.updateAuthority"
						:rules="[
							(val) => !!val || 'Required',
							(val) =>
								isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
								'Invalid address',
						]"
					/>

					<div class="col-auto q-ml-auto">
						<q-checkbox left-label v-model="dataForm.isMutable" label="Mutable" />
					</div>

					<div class="col-12 flex justify-end">
						<q-btn type="reset" color="secondary" label="reset" />
						<q-btn
							type="submit"
							color="primary"
							class="q-ml-sm"
							:disable="!authStore.session"
							:loading="nftStore.creatingCollection"
						>
							<q-icon name="send" />
						</q-btn>
					</div>
				</q-form>
			</q-card>
		</div>
	</q-page>
</template>
