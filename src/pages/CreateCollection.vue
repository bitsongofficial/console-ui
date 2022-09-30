<script setup lang="ts">
import { reactive, ref } from "vue"
import {
	NFTStorageProvider,
	PinataStorageProvider,
	StorageProvider,
} from "@bitsongjs/storage"
import { NFTUploader } from "@bitsongjs/nft"
import { useQuasar } from "quasar"
import { CollectionProvider } from "@/models"

const quasar = useQuasar()

const loading = ref(false)

const providerType = ref(CollectionProvider.NFT_STORAGE)

const nftForm = reactive({
	images: [],
	metadata: [],
	nftStorageToken: "",
	pinataApiKey: "",
	pinataSecretApiKey: "",
	symbol: "",
	name: "",
	uri: "",
	isMutable: false,
	updateAuthority: "",
})

const onSubmit = async () => {
	try {
		loading.value = true

		let provider: StorageProvider

		switch (providerType.value) {
			case CollectionProvider.NFT_STORAGE:
				provider = new NFTStorageProvider({
					token: nftForm.nftStorageToken,
				})
				break
			case CollectionProvider.PINATA:
				provider = new PinataStorageProvider(
					nftForm.pinataApiKey,
					nftForm.pinataSecretApiKey
				)
				break
		}

		const client = new NFTUploader(provider)

		const cid = await client.upload(nftForm.images, nftForm.metadata)

		console.log(cid)

		quasar.notify({
			message: `Files uploaded to IPFS: ${cid.uri}`,
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
	} finally {
		loading.value = false
	}
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

			<q-form @submit="onSubmit">
				<q-card class="q-pa-lg q-mb-md" bordered>
					<div class="flex">
						<q-tabs
							v-model="providerType"
							dense
							no-caps
							inline-label
							class="text-white text-bold q-mb-lg"
							indicator-color="primary"
						>
							<q-tab :ripple="false" name="nft.storage" label="NFT.Storage" />
							<q-tab :ripple="false" name="pinata" label="Pinata" />
						</q-tabs>
					</div>

					<div class="q-col-gutter-md row">
						<template v-if="providerType === 'nft.storage'">
							<q-input
								class="col-12"
								label="NFT.storage Token"
								dense
								filled
								v-model="nftForm.nftStorageToken"
								:rules="[(val) => !!val || 'Required']"
							/>
						</template>
						<template v-else>
							<q-input
								class="col-12 col-md-6"
								label="Pinata API Key"
								dense
								filled
								v-model="nftForm.pinataApiKey"
								:rules="[(val) => !!val || 'Required']"
							/>
							<q-input
								class="col-12 col-md-6"
								label="Pinata Secret API Key"
								dense
								filled
								v-model="nftForm.pinataSecretApiKey"
								:rules="[(val) => !!val || 'Required']"
							/>
						</template>
					</div>

					<div class="w-100"></div>

					<div class="q-col-gutter-md row">
						<q-file
							class="col-12 col-md-6"
							v-model="nftForm.images"
							label="Select Assets"
							dense
							filled
							multiple
							:rules="[(val) => (!!val && val.length > 0) || 'Required']"
						>
							<template v-slot:append>
								<q-icon name="attachment" />
							</template>
						</q-file>

						<q-file
							class="col-12 col-md-6"
							v-model="nftForm.metadata"
							label="Select Metadata"
							dense
							filled
							multiple
							:rules="[(val) => (!!val && val.length > 0) || 'Required']"
						>
							<template v-slot:append>
								<q-icon name="attachment" />
							</template>
						</q-file>
					</div>
				</q-card>
				<q-card class="q-pa-lg" bordered>
					<h5 class="text-bold q-mt-none q-mb-md">Collection Details</h5>
					<div class="q-col-gutter-md row">
						<q-input
							class="col-12 col-md-6"
							label="Name"
							dense
							filled
							v-model="nftForm.name"
							:rules="[(val) => !!val || 'Required']"
						/>

						<q-input
							class="col-12 col-md-6"
							label="Symbol"
							dense
							filled
							v-model="nftForm.symbol"
							:rules="[(val) => !!val || 'Required']"
						/>

						<q-input
							class="col-12 col-md-6"
							label="URI"
							dense
							filled
							v-model="nftForm.uri"
							:rules="[(val) => !!val || 'Required']"
						/>

						<q-input
							class="col-12 col-md-6"
							label="Update Authority"
							dense
							filled
							v-model="nftForm.updateAuthority"
							:rules="[(val) => !!val || 'Required']"
						/>

						<div class="col-12 flex justify-end">
							<q-btn type="submit" color="primary" :loading="loading">
								<q-icon name="send" />
							</q-btn>
							<q-btn type="reset" class="q-ml-sm" color="secondary" label="reset" />
						</div>
					</div>
				</q-card>
			</q-form>
		</div>
	</q-page>
</template>
