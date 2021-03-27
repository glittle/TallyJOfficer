import Vue from 'vue';
import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/database'
import firebaseDb from './firebaseInit'
import i18n from './i18n'
import * as moment from "moment/moment";

export default new Vue({
    i18n,
    data: {
        election: {},
        electionLoadAttempted: false,
        // currentVoting: {},
        // isViewer: false,
        // isAdmin: false,
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
    },
    computed: {
        me() {
            var dummy = this.myId;
            switch (this.myId[0]) {
                case 'm':
                    return this.members.find(m => m.id === this.myId) || {};
                case 'v':
                    return this.viewers.find(v => v.id === this.myId) || {};
            }
            return {};
        },
        numBlankNames: function () {
            return this.members.filter(m => !m.name).length;
        },
        numNonBlankNames: function () {
            return this.members.filter(m => m.name).length;
        },
        numMembers: function () {
            return this.members.length;
        },
        numVotesRequired: function () {
            return 1 + Math.floor(this.numMembers / 2);
        },
        isMember: function () {
            var id = this.me.id;
            return id && id.startsWith('m');
        },
        isViewer: function () {
            var id = this.me.id;
            return id && id.startsWith('v');
        },
        link: function () {
            if (this.firebaseRawAuthUser && this.electionKey) {
                return `${location.origin}/j?${this.electionKey}`;
            }
            return null;
        },
        currentLanguage() {
            return $i18n.locale;
        },
        languages() {
            return this.$t("languages");
        },
        languageCodes() {
            return Object.keys(this.languages);
        },
        dbMe: function () {
            var id = this.me.id;
            if (!id) return {};

            switch (id[0]) {
                case 'm':
                    return firebaseDb.ref(`/members/${this.electionKey}/${this.me.id}`);

                case 'v':
                    return firebaseDb.ref(`/viewers/${this.electionKey}/${this.me.id}`);
            }

            return {};
        }
    },
    watch: {},
    created: function () {
        var vue = this;
        vue.$i18n.locale = 'en'; // avoid flash of random/all languages
        vue.resetLocalElectionInfo();
        vue.handleAuthChanges();
        vue.initialQuery = window.location.search;
    },
    methods: {
        resetLocalElectionInfo() {
            this.election = {};
            this.electionLoadAttempted = false;
            this.members = [];
            this.positions = [];
            this.viewers = [];
            this.rounds = [];
            // this.firebaseRawAuthUser = null;
            this.confirmedVote = false;
            // this.disconnecting = false;
            this.dbElectionRef = null;
            this.initialQuery = '';
            this.symbol = '';
            this.myId = '';
            // this.justClaimed = '';
            this.electionKey = ''
        },
        symbolOffset: function (letter) {
            if (!letter) {
                return 0;
            }
            var num = letter.charCodeAt(0) - 65;
            return num * 34; // offsets in sprite
        },
        electionKeyAbbrev(key) {
            return key ? `${key.substr(1, 3)}.${key.slice(-2)}` : '(no election)';
        },
        processAuthUser(user) {
            var vue = this;

            if (user) {
                // User is signed in.
                vue.firebaseRawAuthUser = user;

                firebaseDb.ref(`/users/${vue.firebaseRawAuthUser.uid}`)
                    .on("value", snapshot => {
                        var userInfo = snapshot.val();

                        vue.$i18n.locale = userInfo.lang || 'en';

                        if (vue.initialQuery) {
                            var key = vue.initialQuery.substring(1);
                            vue.initialQuery = '';
                            vue.loadElection(key);
                        } else if (userInfo.electionKey) {
                            vue.justClaimed = userInfo.memberId;

                            if (userInfo.electionKey !== vue.electionKey) {
                                vue.resetLocalElectionInfo();
                                vue.loadElection(userInfo.electionKey)
                            }
                        } else {
                            vue.resetLocalElectionInfo();
                            vue.electionLoadAttempted = true;
                        }

                        firebaseDb
                            .ref(`/userElections/${vue.firebaseRawAuthUser.uid}`)
                            .on("value", snapshot => {
                                vue.myOldElections = snapshot.val();
                            });

                        firebaseDb.ref(`/users/${vue.firebaseRawAuthUser.uid}`).update({
                            status: "online"
                        });

                        vue.$emit("loggedIn");

                        // if (user.photoURL) {
                        //     vue.loadElection(user.photoURL);
                        // } else {
                        //     // not linked to an election already

                        //     // see if there is a query string that works

                        // }

                        // debugger;
                        // if (vue.initialQuery) {
                        //     var electionKey = vue.initialQuery.substring(1);
                        //     vue.initialQuery = '';
                        //     vue.loadElection(electionKey);
                        // } else if (userInfo.electionKey) {
                        //     vue.justClaimed = userInfo.memberId;

                        //     if (userInfo.electionKey !== vue.electionKey) {
                        //         vue.resetLocalElectionInfo();
                        //         vue.loadElection(userInfo.electionKey);
                        //     }
                        // } else {
                        //     vue.resetLocalElectionInfo();
                        //     vue.electionLoadAttempted = true;
                        // }
                    });

                firebaseDb.ref(`/users/${vue.firebaseRawAuthUser.uid}`)
                    .update({
                        status: 'online',
                    });



            } else {
                // User is signed out.
                vue.firebaseRawAuthUser = null;
                // vue.dbElectionRef = null;
            }
            // ...

        },
        handleAuthChanges: function () {
            var vue = this;
            firebase.auth().onAuthStateChanged(function (user) {
                vue.processAuthUser(user);
            });

            firebase.auth().signInAnonymously().catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log('login error', errorCode, errorMessage)
            });

            firebaseDb.ref('.info/connected')
                .on('value', function (snapshot) {
                    if (!snapshot.val()) {
                        // we are not connected
                        return;
                    }

                    var updates = {};
                    updates.status = 'offline';

                    // gtag('event', 'login')

                    if (vue.firebaseRawAuthUser) {
                        firebaseDb.ref(`/users/${vue.firebaseRawAuthUser.uid}`)
                            .onDisconnect()
                            .update(updates);
                    }
                });
        },
        loadElection: function (electionKey) {
            var vue = this;
            if (electionKey) {
                var electionRef = firebaseDb.ref('/elections/' + electionKey);
                electionRef.once('value')
                    .then(snapshot => {
                        if (snapshot.exists()) {
                            var election = snapshot.val();
                            if (election.deleteMe) {
                                // election is being deleted
                                return;
                            }

                            vue.connectToElection(electionRef);
                        } else {
                            vue.electionLoadAttempted = true;

                            // is this in the userElections list?
                            firebaseDb
                                .ref(
                                    `/userElections/${vue.firebaseRawAuthUser.uid}/${electionKey}`
                                )
                                .remove();
                        }
                    });
            }
        },
        connectToElection: function (electionRef) {
            // we know that ref refers to an actual db entry
            var vue = this;
            // console.log('connected to election', electionRef.key);
            vue.dbElectionRef = electionRef;
            vue.electionKey = electionRef.key;

            firebaseDb.ref(`/users/${vue.firebaseRawAuthUser.uid}`)
                .update({
                    electionKey: vue.electionKey,
                });

            vue.watchForListChanges(vue.members, firebaseDb.ref('/members/' + vue.electionKey).orderByChild('name'), (member, rawData) => {
                if (member.id && (member.id === vue.myId || member.id === vue.justClaimed)) {
                    vue.justClaimed = null;

                    if (vue.me.id) {
                        // I've matched my id to a member account

                        if (!member.connected) {
                            vue.claimMember(member.id);
                        }
                        // my member info has been updated

                        if (member.voted) {
                            vue.confirmedVote = true;
                        }
                    } else if (vue.disconnecting) {
                        vue.disconnecting = false;
                    } else {
                        vue.claimMember(member.id);
                    }

                    // keep them sorted locally
                    clearTimeout(vue.membersSortTimeout);
                    vue.membersSortTimeout = setTimeout(() => {
                        if (vue.myId && !vue.members.length) {
                            // clean up!
                            // there are no people... make me a temporary admin
                            vue.me.isAdmin = true;
                        }

                        vue.members.sort((a, b) =>
                            (a.name.toLocaleLowerCase() || "Z") <
                                (b.name.toLocaleLowerCase() || "Z")
                                ? -1
                                : 1
                        );;

                        if (vue.election && vue.election.created) {
                            firebaseDb
                                .ref(
                                    `/userElections/${vue.firebaseRawAuthUser.uid}/${vue.electionKey}`
                                )
                                .update({
                                    created: vue.election.created,
                                    when: moment().toISOString(),
                                    who: vue.members
                                        .filter(p => p.name)
                                        .map(p => p.name)
                                        .join(", ")
                                });
                        }
                    }, 100);
                }

                if (!member.id && member.connected === false) {
                    // an orphaned member that is recreated by the functions... need to clean this up
                    rawData.ref.remove();
                }
            }, (deletedMember, rawData) => {
                if (deletedMember.id === vue.myId ||
                    deletedMember.id === vue.justClaimed) {
                    // my member info has been removed
                    vue.forgetMe();
                    return;
                }
                if (!deletedMember.id && deletedMember.connected === false) {
                    // an orphaned member that is recreated by the functions... need to clean this up
                    rawData.ref.remove();
                }
            });

            vue.watchForListChanges(vue.positions, firebaseDb.ref('/positions/' + vue.electionKey).orderByChild('sortOrder'), position => {
                vue.positions.sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1);
            });
            vue.watchForListChanges(vue.viewers, firebaseDb.ref('/viewers/' + vue.electionKey).orderByChild('id'), viewer => {
                if (viewer.id && (viewer.id === vue.myId || viewer.id === vue.justClaimed)) {
                    vue.justClaimed = null;
                    if (vue.me.id) {
                        if (!viewer.connected) {
                            vue.claimViewer(viewer.id);
                        }
                    } else if (vue.disconnecting) {
                        vue.disconnecting = false;
                    } else {
                        vue.claimViewer(viewer.id);
                    }
                }
            }, (deletedViewer, rawData) => {
                if (deletedViewer.id === vue.myId ||
                    deletedViewer.id === vue.justClaimed) {
                    // my member info has been removed
                    vue.forgetMe();
                    return;
                }
                if (!deletedViewer.id && deletedViewer.connected === false) {
                    // an orphaned member that is recreated by the functions... need to clean this up
                    rawData.ref.remove();
                }
            });
            vue.watchForListChanges(vue.rounds, firebaseDb.ref('/votingRounds/' + vue.electionKey).orderByChild('id'));

            if (vue.election && vue.election.createdBy) {
                electionRef.update({
                    // record when this election was last used
                    lastLogin: moment().toISOString()
                });
            }

            electionRef.on('value', function (snapshot) {
                var incomingElection = snapshot.val() || {};

                console.log('election changed', incomingElection);
                if (!incomingElection || !incomingElection.createdBy) {
                    // deleted!
                    vue.logout();
                    vue.$emit('goto', '/');
                    return;
                }

                if (!incomingElection.votingOpen && vue.dbMe.update) { // vue.election.votingOpen &&
                    // voting in this round just closed
                    // debugger
                    vue.dbMe.update({
                        voting: false,
                        voted: false
                    });
                }

                if (vue.election.createdBy && incomingElection.votingOpen && !vue.election.votingOpen) {
                    // debugger;
                    vue.symbol = '';
                }

                firebaseDb
                    .ref(`/userElections/${vue.firebaseRawAuthUser.uid}/${vue.electionKey}`)
                    .update({
                        when: moment().toISOString()
                    });

                vue.election = incomingElection;

                vue.electionLoadAttempted = true;
                // console.log('election-changed');
                vue.$emit('election-changed');
            });

        },
        logout() {
            firebaseDb.ref(`/users/${this.firebaseRawAuthUser.uid}`)
                .update({
                    memberId: '',
                    electionKey: ''
                });

            this.resetLocalElectionInfo();
        },
        forgetMe: function () {
            if (this.myId) {
                var oldId = this.myId;

                // disconnect from the member/viewer
                this.disconnecting = true;

                this.myId = '';

                firebaseDb.ref(`/users/${this.firebaseRawAuthUser.uid}`)
                    .update({
                        memberId: ''
                    });

                switch (oldId[0]) {
                    case 'm':
                        // if we are being forced out because the person record is gone, don't try to update it!
                        if (this.members.find(m => m.id === oldId)) {
                            firebaseDb.ref(`/members/${this.electionKey}/${oldId}`)
                                .update({
                                    connected: false,
                                });
                        }
                        break;
                    case 'v':
                        if (this.viewers.find(g => g.id === oldId)) {
                            firebaseDb.ref(`/viewers/${this.gameKey}/${oldId}`)
                                .update({
                                    connected: false,
                                });
                        }
                        break;
                }


                this.$emit('goto', '/e');
            }
        },
        cancelVoting: function () {
            firebaseDb.ref(`/elections/${this.electionKey}`).update({
                votingOpen: false
            });
        },
        watchForListChanges: function (localList, listRef, onAddChange, onRemove) {
            var i;
            listRef.on('child_added', data => {
                // we may have loaded it locally already, so may need to replace it
                var item = data.val();
                i = localList.findIndex(x => x.id === item.id);
                if (i !== -1) {
                    localList.splice(i, 1, item);
                } else {
                    localList.push(item);
                }
                if (onAddChange) {
                    onAddChange(item, data);
                }
            });

            listRef.on('child_changed', data => {
                var item = data.val();
                i = localList.findIndex(x => x.id === item.id);
                if (i !== -1) {
                    localList.splice(i, 1, item);
                } else {
                    // missing??
                    console.log('missing', item.id);
                    localList.push(item);
                }
                if (onAddChange) {
                    onAddChange(item, data);
                }
            });

            listRef.on('child_removed', data => {
                var item = data.val();
                i = localList.findIndex(x => x.id === item.id);
                if (i !== -1) {
                    localList.splice(i, 1);
                    if (onRemove) {
                        onRemove(item, data);
                    }
                } else {
                    // missing??
                    console.log('cannot delete', item);
                }
            });
        },
        claimMember: function (memberId) {
            var vue = this;
            // console.log('set connected', this.firebaseRawAuthUser.uid);
            vue.myId = memberId;
            vue.justClaimed = memberId;
            var me = vue.me;

            if (me.id) {

                firebaseDb.ref(`/members/${vue.electionKey}/${memberId}`)
                    .update({
                        connected: vue.firebaseRawAuthUser.uid,
                        connectedTime: moment().toISOString(),
                        browser: this.getBrowserInfo()
                    });

                firebaseDb.ref(`/users/${vue.firebaseRawAuthUser.uid}`)
                    .update({
                        status: 'online',
                        electionKey: vue.electionKey,
                        memberId: memberId
                    });

                // start watching for symbols to be assigned to me
                var path = `/voterSymbols/${this.electionKey}/${memberId}`;
                firebaseDb.ref(path)
                    .on('value', function (snapshot) {
                        var info = snapshot.val();
                        if (info) {
                            vue.symbol = info.symbol;
                        } else {
                            vue.symbol = '';
                        }
                    })
            } else {
                console.log('Did not find member', memberId);
            }
        },
        claimViewer: function (viewerId) {
            var vue = this;
            vue.myId = viewerId;
            vue.justClaimed = viewerId;
            var me = vue.me;
            // console.log('claim viewer', vue.myId, vue.me.id);

            if (me.id) {
                firebaseDb.ref(`/users/${vue.firebaseRawAuthUser.uid}`)
                    .update({
                        status: 'online',
                        electionKey: vue.electionKey,
                        memberId: viewerId
                    });

                firebaseDb.ref(`/viewers/${this.electionKey}/${viewerId}`).update({
                    connected: this.firebaseRawAuthUser.uid,
                    connectedTime: moment().toISOString(),
                    browser: this.getBrowserInfo()
                });
            }
        },
        getBrowserInfo() {
            // document browser
            return {
                ver: this.getBrowserVersion(),
                lang: window.navigator.language ? window.navigator.language : (window.navigator.systemLanguage + ';' + window.navigator.userLanguage),
                // screen: screen.availWidth + 'x' + screen.availHeight + 'c' + screen.colorDepth,
                window: window.innerWidth + 'x' + window.innerHeight,
            };
        },
        getBrowserVersion() {
            var ua = window.navigator.userAgent;

            var op = ua.match('.*OPR\/([0-9\.]*)');
            if (op && op.length == 2) {
                return 'Opera ' + op[1];
            }

            var chrome = ua.match('.*Chrome\/([0-9\.]*)[$ ]');
            if (chrome && chrome.length == 2) {
                return 'Chrome ' + chrome[1];
            }
            var ff = ua.match('.*Firefox\/([0-9\.]*)');
            if (ff && ff.length == 2) {
                return 'FF ' + ff[1];
            }

            var ie11Plus = ua.match('.*Trident.*rv\:([0-9m\.]*).*');
            if (ie11Plus && ie11Plus.length) {
                return 'IE ' + ie11Plus[1];
            }

            var ieOlder = ua.match('.*MSIE \([0-9\.]*).*');
            if (ieOlder && ieOlder.length) {
                return 'IE ' + ieOlder[1] + 'm' + document.documentMode;
            }

            var safari = ua.match('.*Safari\/([0-9\.]*)');
            if (safari && safari.length == 2) {
                var host = /Mozilla\/.*\((\w*)\;/.exec(ua);
                return 'Safari ' + safari[1] + (host ? ' ' + host[1] : '');
            }

            return 'Unk';
        },
        // startMeAsViewer: function () {
        //     var id = this.getRandomId('v', this.viewers);
        //     var lastName = this.viewers.length ? this.viewers[this.viewers.length - 1].name : null;
        //     // can handle 26 viewers... should not have more than 1 or 2
        //     var nextNum = lastName ? +lastName.substr(1) : 0;
        //     var name = 'V' + (1 + nextNum);
        //     var viewer = {
        //         id: id,
        //         name: name
        //     };

        //     firebaseDb.ref(`/viewers/${this.electionKey}/${id}`).set(viewer);

        //     this.claimViewer(id);
        // },
        // updateList: function(list, doc) {
        //     var item = doc.data();
        //     var i = list.findIndex(x => x.id === item.id);
        //     if (i !== -1) {
        //         list.splice(i, 1, item);
        //     } else {
        //         list.push(item);
        //     }
        // },
        createElection: function (nameOfAdmin) {
            var vue = this;
            if (!vue.firebaseRawAuthUser) {
                return;
            }

            var newAdmin = vue.makeMember(nameOfAdmin, this.members);
            vue.myId = newAdmin.id;

            newAdmin.connected = moment().toISOString();
            newAdmin.isAdmin = true;

            var electionRef = firebaseDb.ref('/elections').push(); // generate new election doc

            electionRef.set({
                created: moment().toISOString(),
                createdBy: nameOfAdmin
            }).then(function () {
                vue.connectToElection(electionRef);

                vue.createMembers(newAdmin);
                vue.createPositions();

                gtag('event', 'createElection');

                vue.claimMember(vue.myId);

                vue.$emit('election-created');
            })
                .catch(function (err) {
                    console.log(err);
                    vue.$emit('election-creation-error', err);
                });
        },
        createMembers: function (adminMember) {
            var vue = this;

            var members = [];
            members.push(adminMember);

            // default to 5 members
            for (var i = 0; i < 4; i++) {
                var member = vue.makeMember('', members);
                members.push(member);
            }

            var memberSet = {};
            members.forEach(m => {
                memberSet[m.id] = m;
            });

            firebaseDb.ref(`/members/${vue.electionKey}`)
                .set(memberSet)

            firebaseDb.ref(`/users/${vue.firebaseRawAuthUser.uid}`)
                .update({
                    memberId: vue.myId
                });
        },
        createPositions: function () {
            // var vue = this;
            var list = [
                'Sample Test',
                'Secretary',
                'Chair',
                'Treasurer',
                'Vice-Chair'
            ];
            var positions = [];
            list.forEach((n, i) => {
                var position = this.makePosition(n, positions);
                position.sortOrder = i;
                positions.push(position);
            });

            positions.forEach(p => firebaseDb.ref(`/positions/${this.electionKey}/${p.id}`).set(p));
        },
        fillData: function () { },
        makePosition: function (name, list) {
            var id = this.getRandomId('p', list);
            return {
                name: name,
                id: id,
                elected: null,
                rounds: [],
                isActive: false,
                sortOrder: 0
            }
        },
        getRandomId: function (prefix, list, numDigits) {
            var uniqueIdFound = false;
            var id;
            numDigits = numDigits || 3;
            while (!uniqueIdFound) {
                id = prefix + Math.random().toString().substr(3, numDigits);
                uniqueIdFound = !list.find(m => m.id === id);
            }
            return id;
        },
        makeMember: function (name, list) {
            var id = this.getRandomId('m', list);
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
            };
        },
        setLang: function (lang) {
            firebaseDb.ref(`/users/${this.firebaseRawAuthUser.uid}`)
                .update({
                    lang: lang,
                });
        }
    }
});