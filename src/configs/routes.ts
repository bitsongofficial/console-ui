import { RouteRecordRaw } from "vue-router"

export const routes: RouteRecordRaw[] = [
	{
		path: "/",
		component: () => import("@/layouts/Default.vue"),
		children: [
			{
				path: "",
				redirect: "/snapshot",
			},
			{
				path: "balances",
				component: () => import("@/pages/Balances.vue"),
			},
			{
				path: "snapshot",
				component: () => import("@/pages/Snapshot.vue"),
			},
			{
				path: "merkledrop",
				component: () => import("@/pages/Merkledrop.vue"),
			},
			{
				path: "fantokens",
				component: () => import("@/pages/Fantokens.vue"),
			},
			{
				path: "launchpad",
				component: () => import("@/pages/Launchpad.vue"),
			},
			{
				path: "collections",
				component: () => import("@/pages/Collections.vue"),
			},
			{
				path: "create-collection",
				component: () => import("@/pages/CreateCollection.vue"),
			},
			{
				path: "create-nft",
				component: () => import("@/pages/CreateNFT.vue"),
			},
			// Osmosis routes
			{
				path: "osmosis-balances",
				component: () => import("@/pages/OsmosisBalances.vue"),
			},
			{
				path: "osmosis-gauges",
				component: () => import("@/pages/OsmosisGauges.vue"),
			},
		],
	},
]
