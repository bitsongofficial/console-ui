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
		],
	},
]
