<script lang="ts" setup>
import { onMounted } from "vue"
import useAuth from "@/store/auth"
import useChain from "./store/chain"

const authStore = useAuth()
const chainStore = useChain()

onMounted(() => {
	setTimeout(() => {
		if (authStore.session) {
			authStore.signIn()
		}

		chainStore.loadBlock()
	}, 500)
})
</script>

<template>
	<router-view />
</template>
