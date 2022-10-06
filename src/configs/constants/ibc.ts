import { getIbcAssets } from "@chain-registry/utils"
import { assets, ibc } from "chain-registry"

export const ibcMap = [
	...getIbcAssets("osmosis", ibc, assets),
	...getIbcAssets("bitsong", ibc, assets),
]

export const ibcBitsongOsmosis = (function () {
	const ibcInfo = ibc.find(
		(el) =>
			el.chain_1.chain_name === "bitsong" && el.chain_2.chain_name === "osmosis"
	)

	if (ibcInfo) {
		const channel = ibcInfo.channels.shift()

		if (channel) {
			return channel
		}
	}
})()

console.log(ibcMap)
