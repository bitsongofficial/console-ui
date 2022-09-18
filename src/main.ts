import { createApp } from "vue"
import { Quasar, Notify } from "quasar"
import { routes } from "@/configs"
import { createRouter, createWebHistory } from "vue-router"
import { createPinia } from "pinia"
import "@/services"

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css"

// Import Quasar css
import "quasar/src/css/index.sass"

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from "./App.vue"
import { createPersistedStatePlugin } from "pinia-plugin-persistedstate-2"

const router = createRouter({
	history: createWebHistory(),
	routes,
})

const pinia = createPinia()

pinia.use(createPersistedStatePlugin())

const app = createApp(App)

app.use(Quasar, {
	plugins: {
		Notify,
	}, // import Quasar plugins and add here
})

app.use(router)

app.use(pinia)

// Assumes you have a <div id="app"></div> in your index.html
app.mount("#app")
