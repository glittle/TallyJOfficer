import { reactive, computed } from 'vue'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'
import firebaseDb from './firebaseInit'
import i18n from './i18n'
import dayjs from 'dayjs'

// Simple event emitter for Vue 3
class EventEmitter {
    constructor() {
        this.events = {}
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = []
        }
        this.events[event].push(callback)
    }

    off(event, callback) {
        if (!this.events[event]) return
        this.events[event] = this.events[event].filter(cb => cb !== callback)
    }

    emit(event, ...args) {
        if (!this.events[event]) return
        this.events[event].forEach(callback => callback(...args))
    }
}

// Create reactive state
const state = reactive({
    election: {},
    electionLoadAttempted: false,
    members: [],
    positions: [],
    viewers: [],
    myOldElections: null,
    rounds: [],
    firebaseRawAuthUser: null,
    confirmedVote: false,
    disconnecting: false,
    dbElectionRef: null,
    initialQuery: '',
    symbol: '',
    myId: '',
    justClaimed: '',
    electionKey: '',
    membersSortTimeout: null,
    viewersSortTimeout: null,
    enableLanguage: false  // disable all language selection options
})

// Create event emitter
const emitter = new EventEmitter()

// Computed properties
const me = computed(() => {
    const dummy = state.myId
    switch (state.myId[0]) {
        case 'm':
            return state.members.find(m => m.id === state.myId) || {}
        case 'v':
            return state.viewers.find(v => v.id === state.myId) || {}
    }
    return {}
})

const numBlankNames = computed(() => {
    return state.members.filter(m => !m.name).length
})

const numNonBlankNames = computed(() => {
    return state.members.filter(m => m.name).length
})

const numMembers = computed(() => {
    return state.members.length
})

const numVotesRequired = computed(() => {
    return 1 + Math.floor(numMembers.value / 2)
})

const isMember = computed(() => {
    const id = me.value.id
    return id && id.startsWith('m')
})

const isViewer = computed(() => {
    const id = me.value.id
    return id && id.startsWith('v')
})

const link = computed(() => {
    if (state.firebaseRawAuthUser && state.electionKey) {
        return `${location.origin}/j?${state.electionKey}`
    }
    return null
})

const currentLanguage = computed(() => {
    return i18n.global.locale.value
})

const languages = computed(() => {
    return i18n.global.t('languages')
})

const languageCodes = computed(() => {
    return Object.keys(languages.value)
})

const dbMe = computed(() => {
    const id = me.value.id
    if (!id) return {}

    switch (id[0]) {
        case 'm':
            return firebaseDb.ref(`/members/${state.electionKey}/${me.value.id}`)

        case 'v':
            return firebaseDb.ref(`/viewers/${state.electionKey}/${me.value.id}`)
    }

    return {}
})

// Methods
const methods = {
    resetLocalElectionInfo() {
        state.election = {}
        state.electionLoadAttempted = false
        state.members = []
        state.viewers = []
        state.positions = []
        state.rounds = []
        state.confirmedVote = false
        state.dbElectionRef = null
        state.initialQuery = ''
        state.symbol = ''
        state.myId = ''
        state.electionKey = ''
    },

    symbolOffset(letter) {
        if (!letter) {
            return 0
        }
        const num = letter.charCodeAt(0) - 65
        return num * 34 // offsets in sprite
    },

    electionKeyAbbrev(key) {
        return key ? `${key.substr(1, 3)}.${key.slice(-2)}` : '(no election)'
    },

    processAuthUser(user) {
        if (user) {
            // User is signed in.
            state.firebaseRawAuthUser = user

            firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
                .on('value', snapshot => {
                    const userInfo = snapshot.val()

                    // Initialize user document if it doesn't exist
                    if (!userInfo) {
                        firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
                            .set({
                                status: 'online',
                                lang: 'en'
                            })
                            .then(() => {
                                // Setup disconnect handler after initialization
                                firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
                                    .onDisconnect()
                                    .update({ status: 'offline' })
                            })
                        return
                    }

                    i18n.global.locale.value = userInfo.lang || 'en'

                    if (state.initialQuery) {
                        const key = state.initialQuery.substring(1)
                        state.initialQuery = ''
                        methods.loadElection(key)
                    } else if (userInfo.electionKey) {
                        state.justClaimed = userInfo.memberId

                        if (userInfo.electionKey !== state.electionKey) {
                            methods.resetLocalElectionInfo()
                            methods.loadElection(userInfo.electionKey)
                        }
                    } else {
                        methods.resetLocalElectionInfo()
                        state.electionLoadAttempted = true
                    }

                    firebaseDb
                        .ref(`/userElections/${state.firebaseRawAuthUser.uid}`)
                        .on('value', snapshot => {
                            state.myOldElections = snapshot.val()
                        })

                    // Set user status to online and setup disconnect handler
                    firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
                        .update({
                            status: 'online',
                        })
                        .then(() => {
                            // Setup disconnect handler after successful status update
                            firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
                                .onDisconnect()
                                .update({ status: 'offline' })
                        })

                    emitter.emit('loggedIn')
                })
        } else {
            // User is signed out.
            state.firebaseRawAuthUser = null
        }
    },

    handleAuthChanges() {
        firebase.auth().onAuthStateChanged(function (user) {
            methods.processAuthUser(user)
        })

        firebase.auth().signInAnonymously().catch(function (error) {
            // Handle Errors here.
            const errorCode = error.code
            const errorMessage = error.message
            console.log('login error', errorCode, errorMessage)
        })
    },

    loadElection(electionKey) {
        if (electionKey) {
            const electionRef = firebaseDb.ref('/elections/' + electionKey)
            
            // Set electionKey in user document first to satisfy security rules
            firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
                .update({
                    electionKey: electionKey,
                })
                .then(() => {
                    return electionRef.once('value')
                })
                .then(snapshot => {
                    if (snapshot.exists()) {
                        const election = snapshot.val()
                        if (election.deleteMe) {
                            // election is being deleted
                            return
                        }

                        methods.connectToElection(electionRef)
                    } else {
                        state.electionLoadAttempted = true

                        // is this in the userElections list?
                        firebaseDb
                            .ref(
                                `/userElections/${state.firebaseRawAuthUser.uid}/${electionKey}`
                            )
                            .remove()
                    }
                })
                .catch(error => {
                    console.error('Error loading election:', error)
                    state.electionLoadAttempted = true
                })
        }
    },

    connectToElection(electionRef) {
        // we know that ref refers to an actual db entry
        state.dbElectionRef = electionRef
        state.electionKey = electionRef.key

        firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
            .update({
                electionKey: state.electionKey,
            })

        methods.watchForListChanges(state.members, firebaseDb.ref('/members/' + state.electionKey).orderByChild('name'), (member, rawData) => {
            if (member.id && (member.id === state.myId || member.id === state.justClaimed)) {
                state.justClaimed = null

                if (me.value.id) {
                    // I've matched my id to a member account

                    if (!member.connected) {
                        methods.claimMember(member.id)
                    }
                    // my member info has been updated

                    if (member.voted) {
                        state.confirmedVote = true
                    }
                } else if (state.disconnecting) {
                    state.disconnecting = false
                } else {
                    methods.claimMember(member.id)
                }

                // keep them sorted locally
                clearTimeout(state.membersSortTimeout)
                state.membersSortTimeout = setTimeout(() => {
                    if (state.myId && !state.members.length) {
                        // clean up!
                        // there are no people... make me a temporary admin
                        me.value.isAdmin = true
                    }

                    state.members.sort((a, b) =>
                        (a.name.toLocaleLowerCase() || 'Z') <
                        (b.name.toLocaleLowerCase() || 'Z')
                            ? -1
                            : 1
                    )

                    if (state.election && state.election.created) {
                        firebaseDb
                            .ref(
                                `/userElections/${state.firebaseRawAuthUser.uid}/${state.electionKey}`
                            )
                            .update({
                                created: state.election.created,
                                when: dayjs().toISOString(),
                                who: state.members
                                    .filter(p => p.name)
                                    .map(p => p.name)
                                    .join(', ')
                            })
                    }
                }, 100)
            }

            if (!member.id && member.connected === false) {
                // an orphaned member that is recreated by the functions... need to clean this up
                rawData.ref.remove()
            }
        }, (deletedMember, rawData) => {
            if (deletedMember.id === state.myId ||
                deletedMember.id === state.justClaimed) {
                // my member info has been removed
                methods.forgetMe()
                return
            }
            if (!deletedMember.id && deletedMember.connected === false) {
                // an orphaned member that is recreated by the functions... need to clean this up
                rawData.ref.remove()
            }
        })

        methods.watchForListChanges(state.positions, firebaseDb.ref('/positions/' + state.electionKey).orderByChild('sortOrder'), position => {
            state.positions.sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1)
        })
        
        methods.watchForListChanges(state.viewers, firebaseDb.ref('/viewers/' + state.electionKey).orderByChild('id'), viewer => {
            if (viewer.id && (viewer.id === state.myId || viewer.id === state.justClaimed)) {
                state.justClaimed = null
                if (me.value.id) {
                    if (!viewer.connected) {
                        methods.claimViewer(viewer.id)
                    }
                } else if (state.disconnecting) {
                    state.disconnecting = false
                } else {
                    methods.claimViewer(viewer.id)
                }
            }
        }, (deletedViewer, rawData) => {
            if (deletedViewer.id === state.myId ||
                deletedViewer.id === state.justClaimed) {
                // my member info has been removed
                methods.forgetMe()
                return
            }
            if (!deletedViewer.id && deletedViewer.connected === false) {
                // an orphaned member that is recreated by the functions... need to clean this up
                rawData.ref.remove()
            }
        })
        
        methods.watchForListChanges(state.rounds, firebaseDb.ref('/votingRounds/' + state.electionKey).orderByChild('id'))

        if (state.election && state.election.createdBy) {
            electionRef.update({
                // record when this election was last used
                lastLogin: dayjs().toISOString()
            })
        }

        electionRef.on('value', function (snapshot) {
            const incomingElection = snapshot.val() || {}

            if (!incomingElection || !incomingElection.createdBy) {
                // deleted!
                methods.logout()
                emitter.emit('goto', '/')
                return
            }

            if (!incomingElection.votingOpen && dbMe.value.update) {
                // voting in this round just closed
                dbMe.value.update({
                    voting: false,
                    voted: false
                })
            }

            if (state.election.createdBy && incomingElection.votingOpen && !state.election.votingOpen) {
                state.symbol = ''
            }

            firebaseDb
                .ref(`/userElections/${state.firebaseRawAuthUser.uid}/${state.electionKey}`)
                .update({
                    when: dayjs().toISOString()
                })

            state.election = incomingElection

            state.electionLoadAttempted = true
            emitter.emit('election-changed')
        })
    },

    logout() {
        firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
            .update({
                memberId: '',
                electionKey: ''
            })

        methods.resetLocalElectionInfo()
    },

    forgetMe() {
        if (state.myId) {
            const oldId = state.myId

            // disconnect from the member/viewer
            state.disconnecting = true

            state.myId = ''

            firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
                .update({
                    memberId: ''
                })

            switch (oldId[0]) {
                case 'm':
                    // if we are being forced out because the person record is gone, don't try to update it!
                    if (state.members.find(m => m.id === oldId)) {
                        firebaseDb.ref(`/members/${state.electionKey}/${oldId}`)
                            .update({
                                connected: false,
                            })
                    }
                    break
                case 'v':
                    if (state.viewers.find(g => g.id === oldId)) {
                        firebaseDb.ref(`/viewers/${state.electionKey}/${oldId}`)
                            .update({
                                connected: false,
                            })
                    }
                    break
            }

            emitter.emit('goto', '/e')
        }
    },

    cancelVoting() {
        firebaseDb.ref(`/elections/${state.electionKey}`).update({
            positionIdToVoteFor: '',
            votingOpen: false
        })
    },

    watchForListChanges(localList, listRef, onAddChange, onRemove) {
        let i
        listRef.on('child_added', data => {
            // we may have loaded it locally already, so may need to replace it
            const item = data.val()
            i = localList.findIndex(x => x.id === item.id)
            if (i !== -1) {
                localList.splice(i, 1, item)
            } else {
                localList.push(item)
            }
            if (onAddChange) {
                onAddChange(item, data)
            }
        })

        listRef.on('child_changed', data => {
            const item = data.val()
            i = localList.findIndex(x => x.id === item.id)
            if (i !== -1) {
                localList.splice(i, 1, item)
            } else {
                // missing??
                if (item.id) {
                    console.log('missing', item.id)
                    localList.push(item)
                }
            }
            if (onAddChange) {
                onAddChange(item, data)
            }
        })

        listRef.on('child_removed', data => {
            const item = data.val()
            i = localList.findIndex(x => x.id === item.id)
            if (i !== -1) {
                localList.splice(i, 1)
                if (onRemove) {
                    onRemove(item, data)
                }
            } else {
                // missing??
                console.log('cannot delete', item)
            }
        })
    },

    claimMember(memberId) {
        state.myId = memberId
        state.justClaimed = memberId
        const meValue = me.value

        if (meValue.id) {
            firebaseDb.ref(`/members/${state.electionKey}/${memberId}`)
                .update({
                    connected: state.firebaseRawAuthUser.uid,
                    connectedTime: dayjs().toISOString(),
                    browser: methods.getBrowserInfo()
                })

            firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
                .update({
                    status: 'online',
                    electionKey: state.electionKey,
                    memberId: memberId
                })

            // start watching for symbols to be assigned to me
            const path = `/voterSymbols/${state.electionKey}/${memberId}`
            firebaseDb.ref(path)
                .on('value', function (snapshot) {
                    const info = snapshot.val()
                    if (info) {
                        state.symbol = info.symbol
                    } else {
                        state.symbol = ''
                    }
                })
        } else {
            console.log('Did not find member', memberId)
        }
    },

    claimViewer(viewerId) {
        state.myId = viewerId
        state.justClaimed = viewerId
        const meValue = me.value

        if (meValue.id) {
            firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
                .update({
                    status: 'online',
                    electionKey: state.electionKey,
                    memberId: viewerId
                })

            firebaseDb.ref(`/viewers/${state.electionKey}/${viewerId}`).update({
                connected: state.firebaseRawAuthUser.uid,
                connectedTime: dayjs().toISOString(),
                browser: methods.getBrowserInfo()
            })
        }
    },

    getBrowserInfo() {
        return {
            ver: methods.getBrowserVersion(),
            lang: window.navigator.language ? window.navigator.language : (window.navigator.systemLanguage + ';' + window.navigator.userLanguage),
            window: window.innerWidth + 'x' + window.innerHeight,
        }
    },

    getBrowserVersion() {
        const ua = window.navigator.userAgent

        const op = ua.match('.*OPR\/([0-9\\.]*)')
        if (op && op.length === 2) {
            return 'Opera ' + op[1]
        }

        const chrome = ua.match('.*Chrome\/([0-9\\.]*)[$ ]')
        if (chrome && chrome.length === 2) {
            return 'Chrome ' + chrome[1]
        }
        const ff = ua.match('.*Firefox\/([0-9\\.]*)')
        if (ff && ff.length === 2) {
            return 'FF ' + ff[1]
        }

        const ie11Plus = ua.match('.*Trident.*rv\:([0-9m\\.]*).* ')
        if (ie11Plus && ie11Plus.length) {
            return 'IE ' + ie11Plus[1]
        }

        const ieOlder = ua.match('.*MSIE \\([0-9\\.]*).*')
        if (ieOlder && ieOlder.length) {
            return 'IE ' + ieOlder[1] + 'm' + document.documentMode
        }

        const safari = ua.match('.*Safari\/([0-9\\.]*)')
        if (safari && safari.length === 2) {
            const host = /Mozilla\/.*\((\w*)\;/.exec(ua)
            return 'Safari ' + safari[1] + (host ? ' ' + host[1] : '')
        }

        return 'Unk'
    },

    createElection(nameOfAdmin) {
        if (!state.firebaseRawAuthUser) {
            return
        }

        const newAdmin = methods.makeMember(nameOfAdmin, state.members)
        state.myId = newAdmin.id

        newAdmin.connected = dayjs().toISOString()
        newAdmin.isAdmin = true

        const electionRef = firebaseDb.ref('/elections').push() // generate new election doc
        const electionKey = electionRef.key

        // Set electionKey in user document first to satisfy security rules
        firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
            .update({
                electionKey: electionKey,
            })
            .then(() => {
                // Now we can create the election data
                return electionRef.set({
                    created: dayjs().toISOString(),
                    createdBy: nameOfAdmin
                })
            })
            .then(function () {
                methods.connectToElection(electionRef)

                // Create members first, then claim after members are written
                return methods.createMembers(newAdmin)
            })
            .then(function () {
                methods.createPositions()

                if (window.gtag) {
                    window.gtag('event', 'createElection')
                }

                methods.claimMember(state.myId)

                emitter.emit('election-created')
            })
            .catch(function (err) {
                console.log(err)
                emitter.emit('election-creation-error', err)
            })
    },

    createMembers(adminMember) {
        const members = []
        members.push(adminMember)

        // default to 5 members
        for (let i = 0; i < 4; i++) {
            const member = methods.makeMember('', members)
            members.push(member)
        }

        const memberSet = {}
        members.forEach(m => {
            memberSet[m.id] = m
        })

        // Return promise to ensure members are written before claiming
        return firebaseDb.ref(`/members/${state.electionKey}`)
            .set(memberSet)
            .then(() => {
                return firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
                    .update({
                        memberId: state.myId
                    })
            })
    },

    createPositions() {
        const list = [
            'Sample Test',
            'Secretary',
            'Chair',
            'Treasurer',
            'Vice-Chair'
        ]
        const positions = []
        list.forEach((n, i) => {
            const position = methods.makePosition(n, positions)
            position.sortOrder = i
            positions.push(position)
        })

        positions.forEach(p => firebaseDb.ref(`/positions/${state.electionKey}/${p.id}`).set(p))
    },

    fillData() { },

    makePosition(name, list) {
        const id = methods.getRandomId('p', list)
        return {
            name: name,
            id: id,
            elected: null,
            rounds: [],
            isActive: false,
            sortOrder: 0
        }
    },

    getRandomId(prefix, list, numDigits) {
        let uniqueIdFound = false
        let id
        numDigits = numDigits || 3
        while (!uniqueIdFound) {
            id = prefix + Math.random().toString().substr(3, numDigits)
            uniqueIdFound = !list.find(m => m.id === id)
        }
        return id
    },

    makeMember(name, list) {
        const id = methods.getRandomId('m', list)
        return {
            name: name || '',
            id: id,
            isAdmin: false,
            connected: false,
            participating: true,

            // temp per position vote
            preferNot: false,
            voted: false,
            voting: false
        }
    },

    setLang(lang) {
        firebaseDb.ref(`/users/${state.firebaseRawAuthUser.uid}`)
            .update({
                lang: lang,
            })
    }
}

// Initialize
state.resetLocalElectionInfo = methods.resetLocalElectionInfo
state.initialQuery = window.location.search
methods.handleAuthChanges()

// Export shared object with state, computed, methods, and event emitter
export const shared = {
    ...state,
    ...methods,
    me,
    numBlankNames,
    numNonBlankNames,
    numMembers,
    numVotesRequired,
    isMember,
    isViewer,
    link,
    currentLanguage,
    languages,
    languageCodes,
    dbMe,
    $on: emitter.on.bind(emitter),
    $off: emitter.off.bind(emitter),
    $emit: emitter.emit.bind(emitter)
}