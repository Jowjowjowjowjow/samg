import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueGtag from "vue-gtag";

createApp(App).use(VueGtag, {
    config: { id: "G-78EWKSVY2T" }
  }).mount("#app");

import './assets/main.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { mdiEye, mdiEyeOff, mdiCheckCircle, mdiCheckCircleOutline, mdiSquare  } from '@mdi/js'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases: {
            ...aliases,
            eye: mdiEye,
            offEye: mdiEyeOff,
            check: mdiCheckCircle,
            unCheck: mdiCheckCircleOutline,
            square: mdiSquare
        },
        sets: {
            mdi,
        }
    }
})

const app = createApp(App)

app.use(vuetify)
app.use(router)

app.mount('#app')
