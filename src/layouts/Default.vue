<script setup lang="ts">
import useAuth from "@/store/auth"
import { ref } from "vue"

const authStore = useAuth()
const leftDrawerOpen = ref(false)
const link = ref("homepage")

const logout = () => {
	authStore.$reset()
}
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

				<q-btn
					class="q-ml-auto"
					type="submit"
					color="primary"
					@click="authStore.signIn"
					v-if="!authStore.session"
				>
					Connect to Keplr
				</q-btn>
				<q-btn
					class="q-ml-auto"
					type="submit"
					color="primary"
					@click="logout"
					v-else
				>
					Disconnect
				</q-btn>
			</q-toolbar>
		</q-header>

		<q-drawer v-model="leftDrawerOpen" side="left" bordered>
			<q-list bordered padding class="rounded-borders text-primary">
				<q-item
					clickable
					v-ripple
					:active="link === 'snapshot'"
					@click="link = 'snapshot'"
					to="/"
				>
					<q-item-section avatar>
						<q-icon name="photo_camera" />
					</q-item-section>

					<q-item-section>Snapshot</q-item-section>
				</q-item>

				<q-item
					clickable
					v-ripple
					:active="link === 'merkledrop'"
					@click="link = 'merkledrop'"
					to="/merkledrop"
				>
					<q-item-section avatar>
						<q-icon name="account_tree" />
					</q-item-section>

					<q-item-section>Merkledrop</q-item-section>
				</q-item>
				<q-item
					clickable
					v-ripple
					:active="link === 'fantokens'"
					@click="link = 'fantokens'"
					to="/fantokens"
				>
					<q-item-section avatar>
						<q-icon name="token" />
					</q-item-section>

					<q-item-section>Fantokens</q-item-section>
				</q-item>
			</q-list>
		</q-drawer>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>
