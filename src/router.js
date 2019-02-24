import Vue from 'vue'
import Router from 'vue-router'
import Election from './views/Election.vue'
import Public from './views/Public.vue'
import ClaimName from './components/ClaimName.vue'
import SetupNames from './components/SetupNames.vue'
import SetupPositions from './components/SetupPositions.vue'
import ElectionHome from './components/ElectionHome.vue'
import VotingPanel from './components/VotingPanel.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [{
            path: '/',
            name: 'public',
            component: Public
        },
        {
            path: '/e',
            name: 'electionRoot',
            component: Election,
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
                },
                // { path: 'names', component: x },
                // { path: 'positions', component: x },
                // { path: '', component: x },
            ]
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () =>
                import ( /* webpackChunkName: "about" */ './views/About.vue')
        }
    ]
})