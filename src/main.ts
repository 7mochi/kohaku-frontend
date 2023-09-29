import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router';
import AuthBoxVue from './components/AuthBox.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: AuthBoxVue },
    ],
});

createApp(App).use(router).mount('#app')
