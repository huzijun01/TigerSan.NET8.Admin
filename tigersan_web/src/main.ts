import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Settings } from './settings'
import { MapModel } from './0_tigersan_ui/tigerui'

await MapModel.LoadAsync(Settings.SecretKey, Settings.AppKey)

const app = createApp(App)
app.use(createPinia())
app.mount('#app')