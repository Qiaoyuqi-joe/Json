import { createRouter, createWebHistory } from 'vue-router'

import Login from '../components/Login'
import Cncgraph3 from '../components/Cncgraph3'
import Cncchart from '../components/Cncchart'
import Nettopology from '../components/Nettopology'



export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Login},
        { path: '/cncgraph', component: Cncgraph3},
        { path: '/cncchart', component: Cncchart},
        { path: '/nettopology', component: Nettopology},
    ]
})
