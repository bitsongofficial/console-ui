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
						<h4 class="q-mb-lg q-mt-none text-bold">Collections</h4>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-12 gap-20">
				<q-card class="col-span-12 col-span-sm-4">
					<q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
						<div class="absolute-bottom text-subtitle2 text-center">Title</div>
					</q-img>
				</q-card>
				<q-card class="col-span-12 col-span-sm-4">
					<q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
						<div class="absolute-bottom text-subtitle2 text-center">Title</div>
					</q-img>
				</q-card>
				<q-card class="col-span-12 col-span-sm-4">
					<q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
						<div class="absolute-bottom text-subtitle2 text-center">Title</div>
					</q-img>
				</q-card>
				<q-card class="col-span-12 col-span-sm-4">
					<q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
						<div class="absolute-bottom text-subtitle2 text-center">Title</div>
					</q-img>
				</q-card>
				<q-card class="col-span-12 col-span-sm-4">
					<q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
						<div class="absolute-bottom text-subtitle2 text-center">Title</div>
					</q-img>
				</q-card>
				<q-card class="col-span-12 col-span-sm-4">
					<q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
						<div class="absolute-bottom text-subtitle2 text-center">Title</div>
					</q-img>
				</q-card>
			</div>
		</div>
	</q-page>
</template>
