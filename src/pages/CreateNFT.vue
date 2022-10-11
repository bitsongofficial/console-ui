<script setup lang="ts">
import { isValidAddress } from "@/common"
import { isNaN, gtnZero } from "@/utils"
import { bitsongChain } from "@/configs"
import { CreateNFT } from "@/models"
import { useQuasar } from "quasar"
import { reactive } from "vue"
import useAuth from "@/store/auth"
import useNFT from "@/store/nft"

const quasar = useQuasar()
const authStore = useAuth()
const nftStore = useNFT()

const dataForm = reactive<CreateNFT>({
	uri: "",
	collId: "",
	sellerFeeBasisPoints: 0,
	primarySaleHappened: false,
	isMutable: true,
	creators: [],
	metadataAuthority: "",
	mintAuthority: "",
	masterEdition: {
		maxSupply: "0",
		supply: "0",
	},
})

const onSubmit = async () => {
	console.log(dataForm)
	try {
		const nftId = await nftStore.createNFT({
			...dataForm,
		})

		onReset()

		quasar.notify({
			message: `New NFT created with ID: ${nftId}`,
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
	dataForm.uri = ""
	dataForm.collId = ""
	dataForm.uri = ""
	dataForm.sellerFeeBasisPoints = 0
	dataForm.primarySaleHappened = false
	dataForm.isMutable = true
	dataForm.creators = []
	dataForm.metadataAuthority = ""
	dataForm.mintAuthority = ""
	dataForm.masterEdition = {
		maxSupply: "0",
		supply: "0",
	}
}

const addCreator = () => {
	dataForm.creators.push({
		address: "",
		verified: false,
		share: 0,
	})
}

const removeCreator = (index: number) => {
	dataForm.creators.splice(index, 1)
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
						label="Collection ID"
						dense
						filled
						v-model="dataForm.collId"
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
						label="Seller Fee Basis Points"
						dense
						filled
						v-model.number="dataForm.sellerFeeBasisPoints"
						type="number"
						:rules="[(val) => !!val || 'Required']"
					/>

					<q-input
						class="col-12 col-md-6"
						label="Metadata Authority"
						dense
						filled
						v-model="dataForm.metadataAuthority"
						:rules="[
							(val) => !!val || 'Required',
							(val) =>
								isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
								'Invalid address',
						]"
					/>

					<q-input
						class="col-12 col-md-6"
						label="Mint Authority"
						dense
						filled
						v-model="dataForm.mintAuthority"
						:rules="[
							(val) => !!val || 'Required',
							(val) =>
								isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
								'Invalid address',
						]"
					/>

					<q-input
						v-if="dataForm.masterEdition"
						class="col-12 col-md-6"
						label="Master Edition Max Supply"
						dense
						filled
						v-model="dataForm.masterEdition.maxSupply"
						:rules="[
							(val) => !!val || 'Required field',
							(val) => !isNaN(val) || 'Amount must be a decimal value',
							(val) => gtnZero(val) || 'Amount must be a greater then zero',
						]"
					/>

					<q-input
						v-if="dataForm.masterEdition"
						class="col-12 col-md-6"
						label="Master Edition Supply"
						dense
						filled
						v-model="dataForm.masterEdition.supply"
						:rules="[
							(val) => !!val || 'Required field',
							(val) => !isNaN(val) || 'Amount must be a decimal value',
							(val) => gtnZero(val) || 'Amount must be a greater then zero',
						]"
					/>

					<div class="col-12 row items-center">
						<h5 class="q-my-none">Creators</h5>

						<q-btn
							class="q-ml-md"
							color="primary"
							no-caps
							round
							rounded
							:disable="!authStore.session"
							size="sm"
							@click="addCreator"
						>
							<q-icon name="add"></q-icon>
						</q-btn>
					</div>

					<p v-if="dataForm.creators.length === 0">
						There are no creators, press "+" to add one
					</p>

					<div v-for="(_, index) in dataForm.creators" :key="index" class="col-12">
						<q-card class="q-pa-sm q-col-gutter-xs row" bordered>
							<q-input
								class="col-12 col-md-4"
								label="Address"
								dense
								filled
								v-model="dataForm.creators[index].address"
								:rules="[
									(val) => !!val || 'Required',
									(val) =>
										isValidAddress(val, bitsongChain?.bech32_prefix ?? '') ||
										'Invalid address',
								]"
								hide-bottom-space
							/>
							<q-input
								class="col-12 col-md-4"
								label="Share"
								dense
								filled
								v-model.number="dataForm.creators[index].share"
								:rules="[
									(val) => !!val || 'Required field',
									(val) => !isNaN(val) || 'Amount must be a decimal value',
									(val) => gtnZero(val) || 'Amount must be a greater then zero',
								]"
								hide-bottom-space
							/>

							<q-checkbox
								class="col"
								left-label
								v-model="dataForm.creators[index].verified"
								label="Verified"
							/>

							<div class="col-auto row">
								<q-btn
									class="q-my-auto"
									color="primary"
									no-caps
									round
									rounded
									:disable="!authStore.session"
									size="xs"
									@click="removeCreator(index)"
								>
									<q-icon name="remove"></q-icon>
								</q-btn>
							</div>
						</q-card>
					</div>

					<div class="col-12 row justify-end">
						<q-checkbox left-label v-model="dataForm.isMutable" label="Mutable" />
						<q-checkbox
							left-label
							v-model="dataForm.primarySaleHappened"
							label="Primary Sale Happened"
						/>
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
