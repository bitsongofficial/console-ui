<script setup lang="ts">
import { formatShortAddress } from "@/common"
import useAuth from "@/store/auth"
import { ref } from "vue"
import { useClipboard } from '@/hooks';

const authStore = useAuth()
const leftDrawerOpen = ref(true)
const link = ref("homepage")
const { onCopy } = useClipboard()

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
			<q-list padding class="rounded-borders text-primary">
				<q-item-label class="q-pb-sm" header>BitSong Testnet</q-item-label>
				<q-item
					clickable
					v-ripple
					:active="link === 'balances'"
					@click="link = 'balances'"
					to="/balances"
				>
					<q-item-section avatar>
						<q-icon name="savings" />
					</q-item-section>

					<q-item-section>Balances</q-item-section>
				</q-item>

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
				<q-item
					clickable
					v-ripple
					:active="link === 'contracts'"
					@click="link = 'contracts'"
					to="/contracts"
				>
					<q-item-section avatar>
						<q-icon name="description" />
					</q-item-section>

					<q-item-section>Smart Contracts</q-item-section>
				</q-item>

				<q-item-label class="q-pb-sm q-mt-md" header>Osmosis Testnet</q-item-label>
				<q-item
					clickable
					v-ripple
					:active="link === 'osmosis-balances'"
					@click="link = 'osmosis-balances'"
					to="/osmosis-balances"
				>
					<q-item-section avatar>
						<q-icon name="savings" />
					</q-item-section>

					<q-item-section>Balances</q-item-section>
				</q-item>
				<q-item
					clickable
					v-ripple
					:active="link === 'osmosis-gauges'"
					@click="link = 'osmosis-gauges'"
					to="/osmosis-gauges"
				>
					<q-item-section avatar>
						<q-icon name="data_saver_on" />
					</q-item-section>

					<q-item-section>Gauges</q-item-section>
				</q-item>

				<div v-if="authStore.bitsongAddress && authStore.osmosisAddress">
					<q-item-label class="q-pb-sm q-mt-md" header>Address List</q-item-label>
					<div class="row justify-between items-end full-width footer no-wrap">
						<q-item-label class="q-pb-xs q-mt-md" header>{{ formatShortAddress(authStore.bitsongAddress, 6) }}</q-item-label>
						<q-btn @click="onCopy(authStore.bitsongAddress)" icon="content_copy" class="q-mr-sm" size="sm" flat round></q-btn>
					</div>
					<div class="row justify-between items-end full-width footer no-wrap">
						<q-item-label class="q-pb-xs q-mt-md" header>{{ formatShortAddress(authStore.osmosisAddress, 6) }}</q-item-label>
						<q-btn @click="onCopy(authStore.osmosisAddress)" icon="content_copy" class="q-mr-sm" size="sm" flat round></q-btn>
					</div>
				</div>
			</q-list>
		</q-drawer>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>
