import { RouteRecordRaw } from "vue-router"

export const routes: RouteRecordRaw[] = [
	{
		path: "/",
		component: () => import("@/layouts/Default.vue"),
		children: [
			{
				path: "",
				component: () => import("@/pages/Merkledrop.vue"),
			},
		],
	},
]
