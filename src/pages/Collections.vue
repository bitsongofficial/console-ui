<script setup lang="ts"></script>

<template>
	<q-page class="fit q-pa-md">
		<div class="max-w-xl container">
			<div class="col-auto">
				<div class="row">
					<div class="col">
						<h4 class="q-mb-lg q-mt-none text-bold">Collections</h4>
					</div>
					<div class="col-auto">
						<q-btn
							color="primary"
							label="Create Collection"
							no-caps
							to="/create-collection"
						/>
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
