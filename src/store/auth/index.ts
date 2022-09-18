import { isValidAddress } from "@/common"
import { Session, SessionType } from "@/models"
import { acceptHMRUpdate, defineStore } from "pinia"
import { bitsongChain } from "@/configs"
import useKeplr from "@/store/keplr"
import useBank from "@/store/bank"

export interface AuthState {
	loading: boolean
	session?: Session
}

const useAuth = defineStore("auth", {
	state: (): AuthState => ({
		loading: false,
		session: undefined,
	}),
	actions: {
		async signIn() {
			try {
				if (window.keplr) {
					const keplrStore = useKeplr()
					const bankStore = useBank()
					this.loading = true

					await keplrStore.init()

					this.session = {
						sessionType: SessionType.KEPLR,
						addresses: keplrStore.accounts.map((el) => el.address),
					}

					bankStore.loadBalance()
				}
			} catch (error) {
				console.error(error)
				throw error
			} finally {
				this.loading = false
			}
		},
	},
	getters: {
		bitsongAddress({ session }) {
			if (session && bitsongChain) {
				return session.addresses.find((address) =>
					isValidAddress(address, bitsongChain?.bech32_prefix ?? "")
				)
			}
		},
		getAddress({ session }) {
			return (addressPrefix: string) => {
				if (session) {
					return session.addresses.find((address) =>
						isValidAddress(address, addressPrefix)
					)
				}
			}
		},
	},
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAuth, import.meta.hot))
}

export default useAuth
