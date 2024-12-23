import { createRouter, createWebHistory } from 'vue-router'

import Login from '../components/Login'
import Cncgraph from '../components/Cncgraph'
import Cncchart from '../components/Cncchart'
import Nettopology from '../components/Nettopology'
import Usergraph from '../components/Usergraph'
import AdminDashboard from '../components/AdminDashboard'



export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Login},
        { path: '/cncgraph', component: Cncgraph},
        { path: '/cncchart', component: Cncchart},
        { path: '/nettopology', component: Nettopology},
        { path: '/usergraph', component: Usergraph},
        { path: '/admindashboard', component: AdminDashboard},
    ]
})
