import Vue from 'vue'
import Router from 'vue-router'
import Public from './views/Public.vue'
import ClaimName from './components/ClaimName.vue'
import SetupNames from './components/SetupNames.vue'
import SetupPositions from './components/SetupPositions.vue'
import ElectionHome from './components/ElectionHome.vue'
import VotingPanel from './components/VotingPanel.vue'
import ResultPanel from './components/ResultPanel.vue'
import CreateElection from './components/CreateElection.vue'
import AdminPanel from './components/AdminPanel.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [{
            path: '/',
            name: 'public',
            component: Public
        }, {
            path: '/guidance',
            name: 'guidance',
            component: () =>
                import ( /* webpackChunkName: "guidance" */ './views/Guidance.vue')
        },
        {
            path: '/e',
            name: 'electionRoot',
            component: () =>
                import ( /* webpackChunkName: "election" */ './views/Election.vue'),
            children: [{
                    path: 'home',
                    name: 'electionHome',
                    component: ElectionHome
                }, {
                    path: 'claim',
                    name: 'claim',
                    component: ClaimName
                }, {
                    path: 'setupNames',
                    name: 'setupNames',
                    component: SetupNames
                }, {
                    path: 'setupPositions',
                    name: 'setupPositions',
                    component: SetupPositions
                }, {
                    path: 'votingPanel',
                    name: 'votingPanel',
                    component: VotingPanel
                }, {
                    path: 'resultPanel',
                    name: 'resultPanel',
                    component: ResultPanel
                }, {
                    path: 'create',
                    name: 'createElection',
                    component: CreateElection
                }, {
                    path: 'admin',
                    name: 'adminPanel',
                    component: AdminPanel
                }
                // { path: 'names', component: x },
                // { path: 'positions', component: x },
                // { path: '', component: x },
            ]
        },
        // {
        //     path: '/about',
        //     name: 'about',
        //     // route level code-splitting
        //     // this generates a separate chunk (about.[hash].js) for this route
        //     // which is lazy-loaded when the route is visited.
        //     component: () =>
        //         import ( /* webpackChunkName: "about" */ './views/About.vue')
        // }
    ]
})