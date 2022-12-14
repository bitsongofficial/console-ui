import { defineConfig } from "vite"
import { quasar, transformAssetUrls } from "@quasar/vite-plugin"
import vue from "@vitejs/plugin-vue"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			template: { transformAssetUrls },
		}),
		quasar({
			sassVariables: "src/quasar-variables.scss",
		}),
	],
	resolve: {
		alias: {
			// @ts-ignore
			"@": path.resolve(__dirname, "./src"),
		},
	},
	define: {
		"process.env": {},
		"process.platform": {},
	},
})
