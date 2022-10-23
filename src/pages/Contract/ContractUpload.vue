<script setup lang="ts">
import { ref } from "vue"

const contractWasm = ref()
</script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Upload a wasm file</h4>
					</div>
				</div>
			</div>

			<div class="row">
				<q-card class="col-12 col-md-6 q-pa-lg q-mb-lg q-mx-auto" bordered>
					<q-file
						v-model="contractWasm"
						label="Upload a wasm file"
						dense
						filled
						:rules="[(val) => !!val || 'Required']"
					>
						<template v-slot:append>
							<q-icon name="attachment" />
						</template>
					</q-file>

					<q-btn
						class="full-width q-mt-sm"
						type="submit"
						label="Upload"
						color="primary"
					/>
				</q-card>
			</div>
		</div>
	</q-page>
</template>
