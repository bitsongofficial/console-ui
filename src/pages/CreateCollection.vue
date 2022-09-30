<script setup lang="ts">
import { reactive, ref } from "vue"
import { NFTStorageProvider } from "@bitsongjs/storage"
import { NFTUploader } from "@bitsongjs/nft"
import { useQuasar } from "quasar"

const quasar = useQuasar()

const loading = ref(false)

const nftForm = reactive({
	images: [],
	metadata: [],
	nftStorageToken: "",
})

const onSubmit = async () => {
	try {
		loading.value = true

		const provider = new NFTStorageProvider({
			token: nftForm.nftStorageToken,
		})

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

			<div class="col-auto">
				<q-form @submit="onSubmit" class="q-col-gutter-md row q-mb-lg">
					<q-input
						class="col-12 col-md-4 col-lg-3"
						label="NFT.storage Token"
						dense
						filled
						v-model="nftForm.nftStorageToken"
						:rules="[(val) => !!val || 'Required']"
					/>

					<q-file
						class="col-12 col-md-4 col-lg-3"
						v-model="nftForm.images"
						label="Pick images"
						dense
						filled
						multiple
						:rules="[(val) => (!!val && val.length > 0) || 'Required']"
					/>

					<q-file
						class="col-12 col-md-4 col-lg-3"
						v-model="nftForm.metadata"
						label="Pick metadata"
						dense
						filled
						multiple
						:rules="[(val) => (!!val && val.length > 0) || 'Required']"
					/>

					<div class="col-12 flex justify-end">
						<q-btn type="submit" color="primary" :loading="loading">
							<q-icon name="send" />
						</q-btn>
						<q-btn type="reset" class="q-ml-sm" color="secondary" label="reset" />
					</div>
				</q-form>
			</div>
		</div>
	</q-page>
</template>
