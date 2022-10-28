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
			// Smart Contracts
			{
				path: "contracts",
				children: [
					{
						path: "",
						component: () => import("@/pages/Contract/Contracts.vue"),
					},
					{
						path: "code/:code",
						component: () => import("@/pages/Contract/ContractCode.vue"),
					},
					{
						path: "upload",
						component: () => import("@/pages/Contract/ContractUpload.vue"),
					},
					{
						path: "instantiate",
						component: () => import("@/pages/Contract/ContractInstantiate.vue"),
					},
					{
						path: "instantiate/:code",
						component: () => import("@/pages/Contract/ContractInstantiate.vue"),
					},
				],
			},
			{
				path: "contract/:contract",
				children: [
					{
						path: "",
						component: () => import("@/pages/Contract/Contract.vue"),
					},
					{
						path: "interact",
						component: () => import("@/pages/Contract/ContractInteract.vue"),
					},
				],
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
