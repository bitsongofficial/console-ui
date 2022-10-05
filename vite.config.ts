import { defineConfig } from "vite"
import { quasar, transformAssetUrls } from "@quasar/vite-plugin"
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill"
import vue from "@vitejs/plugin-vue"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: "globalThis",
			},
			// Enable esbuild polyfill plugins
			plugins: [
				NodeGlobalsPolyfillPlugin({
					buffer: true,
				}),
			],
		},
	},
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
