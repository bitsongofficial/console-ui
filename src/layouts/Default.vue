<script setup lang="ts">
import { ref } from "vue"

const leftDrawerOpen = ref(false)
const link = ref("homepage")
</script>

<template>
	<q-layout view="hHh lpR fFf">
		<q-header class="bg-secondary text-white">
			<q-toolbar class="q-py-xs">
				<q-btn
					dense
					flat
					round
					icon="menu"
					@click="leftDrawerOpen = !leftDrawerOpen"
				/>

				<q-img
					class="q-ml-lg"
					src="@/assets/logo-institutional.svg"
					height="40px"
					width="140px"
					fit="contain"
				/>
			</q-toolbar>
		</q-header>

		<q-drawer v-model="leftDrawerOpen" side="left" bordered>
			<q-list bordered padding class="rounded-borders text-primary">
				<q-item
					clickable
					v-ripple
					:active="link === 'homepage'"
					@click="link = 'homepage'"
				>
					<q-item-section avatar>
						<q-icon name="home" />
					</q-item-section>

					<q-item-section>Homepage</q-item-section>
				</q-item>

				<q-item
					clickable
					v-ripple
					:active="link === 'outbox'"
					@click="link = 'outbox'"
				>
					<q-item-section avatar>
						<q-icon name="account_tree" />
					</q-item-section>

					<q-item-section>Merkledrop</q-item-section>
				</q-item>
			</q-list>
		</q-drawer>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>
