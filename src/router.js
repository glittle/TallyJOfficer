import Vue from 'vue'
import Router from 'vue-router'
import Public from './views/Public.vue'

Vue.use(Router)

var router = new Router({
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
        }, {
            path: '/faq',
            name: 'faq',
            component: () =>
                import ( /* webpackChunkName: "public2" */ './components/FAQ.vue')
        },
        {
            path: '/e',
            name: 'electionRoot',
            component: () =>
                import ( /* webpackChunkName: "main" */ './views/Election.vue'),
            children: [{
                    path: '/j',
                    name: 'join',
                    component: () =>
                        import ( /* webpackChunkName: "public2" */ './components/Join.vue')
                }, {
                    path: 'home',
                    name: 'electionHome',
                    component: () =>
                        import ( /* webpackChunkName: "main" */ './components/ElectionHome.vue')
                }, {
                    path: 'claim',
                    name: 'claim',
                    component: () =>
                        import ( /* webpackChunkName: "main" */ './components/ClaimName.vue')
                }, {
                    path: 'votingPanel',
                    name: 'votingPanel',
                    component: () =>
                        import ( /* webpackChunkName: "main2" */ './components/VotingPanel.vue')
                }, {
                    path: 'resultPanel',
                    name: 'resultPanel',
                    component: () =>
                        import ( /* webpackChunkName: "main2" */ './components/ResultPanel.vue')
                }, {
                    path: 'setupNames',
                    name: 'setupNames',
                    component: () =>
                        import ( /* webpackChunkName: "admin" */ './components/SetupNames.vue')
                }, {
                    path: 'setupPositions',
                    name: 'setupPositions',
                    component: () =>
                        import ( /* webpackChunkName: "admin" */ './components/SetupPositions.vue')
                }, {
                    path: 'create',
                    name: 'createElection',
                    component: () =>
                        import ( /* webpackChunkName: "admin" */ './components/CreateElection.vue')
                }, {
                    path: 'admin',
                    name: 'adminPanel',
                    component: () =>
                        import ( /* webpackChunkName: "admin" */ './components/AdminPanel.vue')
                }, {
                    path: 'share',
                    name: 'share',
                    component: () =>
                        import ( /* webpackChunkName: "main2" */ './components/Share.vue')
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
});

router.afterEach((to, from) => {
    gtag('event', 'screen_view', {
        screen_name: to.name,
    })
})

export default router;