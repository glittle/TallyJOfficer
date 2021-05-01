/* eslint-disable space-in-parens */
/* eslint-disable func-call-spacing */
import Vue from 'vue'
import Router from 'vue-router'
import Public from './views/Public.vue'

Vue.use(Router)

const title = 'TallyJ for Officers';

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
        meta: {
            title: 'Guidance',
            tags: {
                description: 'Guidance regarding offices of a Bahá’í Assembly.'
            }
        },
        component: () =>
            import( /* webpackChunkName: "guidance" */ './views/Guidance.vue')
    }, {
        path: '/faq',
        name: 'faq',
        meta: {
            title: 'Help',
            tags: {
                description: 'Questiions and Answers about TallyJ for Officers.'
            }
        },
        component: () =>
            import( /* webpackChunkName: "public2" */ './components/FAQ.vue')
    },
    {
        path: '/e',
        name: 'electionShell',
        component: () =>
            import( /* webpackChunkName: "main" */ './views/ElectionShell.vue'),
        children: [{
            path: '/j',
            name: 'join',
            meta: {
                title: 'Joining',
            },
            component: () =>
                import( /* webpackChunkName: "public3" */ './components/Join.vue')
        }, {
            path: '/e/home',
            name: 'overview',
            meta: {
                title: 'Voting',
            },
            component: () =>
                import( /* webpackChunkName: "main" */ './components/Overview.vue')
        }, {
            path: '/e/claim',
            meta: {
                title: 'Claim Name',
            },
            name: 'claim',
            component: () =>
                import( /* webpackChunkName: "main" */ './components/ClaimName.vue')
        }, {
            //     path: '/e/votingPanel',
            //     name: 'votingPanel',
            //     component: () =>
            //         import ( /* webpackChunkName: "main2" */ './components/VotingPanel.vue')
            // }, {
            //     path: '/e/resultPanel',
            //     name: 'resultPanel',
            //     component: () =>
            //         import ( /* webpackChunkName: "main2" */ './components/ResultPanel.vue')
            // }, {
            //     path: '/e/setupNames',
            //     name: 'setupNames',
            //     component: () =>
            //         import ( /* webpackChunkName: "admin" */ './components/SetupNames.vue')
            // }, {
            //     path: '/e/setupPositions',
            //     name: 'setupPositions',
            //     component: () =>
            //         import ( /* webpackChunkName: "admin" */ './components/SetupPositions.vue')
            // }, {
            path: '/e/create',
            name: 'createElection',
            meta: {
                title: 'Create an Election'
            },
            component: () =>
                import( /* webpackChunkName: "admin" */ './components/CreateElection.vue')
        }, {
            path: '/e/admin',
            name: 'adminPanel',
            meta: {
                title: 'Admin',
            },
            component: () =>
                import( /* webpackChunkName: "admin" */ './components/AdminPanel.vue')
        }, {
            path: '/e/share',
            name: 'share',
            meta: {
                title: 'Share Link',
            },
            component: () =>
                import( /* webpackChunkName: "main2" */ './components/Share.vue')
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
    // console.log('route to', to)
    gtag('event', 'screen_view', {
        screen_name: to.name,
    });

    if (Tawk_API && Tawk_API.showWidget) {
        if (['adminPanel', 'faq', 'share', 'createElection'].includes(to.name)) {
            Tawk_API.showWidget();
        } else {
            Tawk_API.hideWidget();
        }
    } else {
        // must be on home page
        // setTimeout(function () {
        //     if (Tawk_API && Tawk_API.showWidget) {
        //         Tawk_API.hideWidget();
        //     }
        // }, 1000);
    }
    setTimeout(function () {
        var eb = window.document.getElementById('electionBody');
        if (eb && eb.scrollTo) {
            // console.log('scrollTo 0');
            eb.scrollTo(0, 0);
        }
    }, 0);

    var meta = to.meta;
    if (meta.title) {
        window.document.title = [title, meta.title].join(' - ');
    } else {
        window.document.title = title;
    }
})

router.beforeEach((to, from, next) => {
    var metaTags = to.meta.tags;
    if (metaTags) {
        var allMeta = Array.from(document.getElementsByTagName('meta'));
        Object.keys(metaTags).forEach(key => {
            var tag = document.createElement('meta');
            tag.setAttribute('name', key);
            tag.setAttribute('content', metaTags[key]);
            var existing = allMeta.find(m => m.name === key);
            document.head.insertBefore(tag, existing);
        })
    }
    next();
})

export default router;