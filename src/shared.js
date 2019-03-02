import Vue from 'vue';
import firebase from 'firebase'
import db from './firebaseInit'

export default new Vue({
    data: {
        election: {},
        electionLoadAttempted: false,
        me: {},
        isViewer: localStorage['isViewer'] === 'true',
        // isAdmin: localStorage['isAdmin'] === 'true',
        members: [],
        positions: [],
        viewers: [],
        rounds: [],
        dbUser: null,
        dbElectionRef: null,
        initialQuery: '',
        electionId: ''
    },
    computed: {
        myIdFromProfile: function() {
            return this.dbUser ? this.dbUser.displayName : null;
        },
        numBlankNames: function() {
            return this.members.filter(m => !m.name).length;
        },
        numMembers: function() {
            return this.members.length;
        },
        link: function() {
            if (this.dbUser) {
                return `${location.origin}/e/claim?${this.dbUser.photoURL}`;
            }
            return null;
        }
    },
    watch: {
        // myId: function() {
        //     localStorage['myId'] = this.myId;
        // },
        isViewer: function() {
            localStorage['isViewer'] = this.isViewer;
        },
        // isAdmin: function() {
        //     localStorage['isAdmin'] = this.isAdmin;
        // },
        // members: {
        //    handler: function(a, b) {
        //        if (!this.dbElectionRef) return;
        //        var dbList = this.dbElectionRef.collection('members');
        //        this.members.forEach(m => dbList.doc(m.id).set(m, {
        //            merge: true
        //        }));
        //    },
        //    deep: true
        // },
        // viewers: {
        //    handler: function(a, b) {
        //        if (!this.dbElectionRef) return;
        //        var dbList = this.dbElectionRef.collection('viewers');
        //        this.viewers.forEach(v => dbList.doc(v.id).set(v, {
        //            merge: true
        //        }));
        //    },
        //    deep: true
        // },
        // positions: {
        //    handler: function(a, b) {
        //        if (!this.dbElectionRef) return;
        //        var dbList = this.dbElectionRef.collection('positions');
        //        this.positions.forEach(p => dbList.doc(p.id).set(p, {
        //            merge: true
        //        }));
        //    },
        //    deep: true
        // }
    },
    created: function() {
        var vue = this;
        // debugger
        vue.handleAuthChanges();

        vue.initialQuery = window.location.search;
    },
    methods: {
        handleAuthChanges: function() {
            var vue = this;
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // User is signed in.
                    vue.dbUser = user;

                    if (user.photoURL) {
                        vue.loadElection(user.photoURL);
                    } else {
                        // not linked to an election already

                        // see if there is a query string that works
                        if (vue.initialQuery) {
                            vue.loadElection(vue.initialQuery.substring(1));
                        } else {
                            vue.electionLoadAttempted = true;
                        }
                    }
                } else {
                    // User is signed out.
                    // ...
                    vue.dbUser = null;
                    vue.dbElectionRef = null;
                }
                // ...
            });

            firebase.auth().signInAnonymously().catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log('login error', errorCode, errorMessage)
            });
        },
        loadElection: function(electionId) {
            var vue = this;
            if (electionId) {
                var ref = db.collection('elections').doc(electionId);
                ref.get()
                    .then(function(doc) {
                        if (doc.exists) {
                            vue.connectToElection(ref);
                        } else {
                            // invalid, so forget about it
                            vue.dbUser.updateProfile({
                                photoURL: '',
                                displayName: ''
                            });

                            vue.electionLoadAttempted = true;

                            vue.dbElectionRef = null;
                        }
                    }).catch(function(err) {
                        vue.dbUser.updateProfile({
                            photoURL: '',
                            displayName: ''
                        });
                        vue.electionLoadAttempted = true;
                        console.log(err);
                    });
            }
        },
        connectToElection: function(ref) {
            var vue = this;

            vue.dbElectionRef = ref;
            vue.electionId = ref.id;
            vue.dbUser.updateProfile({
                photoURL: ref.id
            });

            ref.onSnapshot(function(d) {
                vue.election = d.data() || {};

                // if (vue.dbUser.photoURL !== d.id) {
                //     // remember this election
                //     vue.dbUser.updateProfile({
                //         photoURL: d.id
                //     });
                // }

                // get my id
                vue.electionLoadAttempted = true;
                vue.$emit('election-loaded');
            });

            ref.collection('members').orderBy('name')
                .onSnapshot(function(snapshot) {
                    snapshot.docChanges.forEach(function(change) {
                        vue.changeList(vue.members, change);

                        // pick myself out of the list!
                        if (change.type === 'added' && !vue.me.id && vue.myIdFromProfile) {
                            var item = change.doc.data();
                            if (item.id === vue.myIdFromProfile) {
                                vue.me = item;
                            }
                        }
                    });
                });

            ref.collection('positions').orderBy('sortOrder')
                .onSnapshot(function(snapshot) {
                    snapshot.docChanges.forEach(function(change) {
                        vue.changeList(vue.positions, change);
                    });
                });

            ref.collection('viewers').orderBy('id')
                .onSnapshot(function(snapshot) {
                    snapshot.docChanges.forEach(function(change) {
                        vue.changeList(vue.viewers, change);
                    });
                });

            ref.collection('rounds').orderBy('id')
                .onSnapshot(function(snapshot) {
                    snapshot.docChanges.forEach(function(change) {
                        vue.changeList(vue.rounds, change);
                    });
                });

            ref.update({
                lastLogin: new Date()
            });
        },
        changeList: function(list, change) {
            var item = change.doc.data();
            var i;
            switch (change.type) {
                case 'added':
                    list.push(item);
                    break;
                case 'modified':
                    i = list.findIndex(x => x.id === item.id);
                    if (i !== -1) {
                        list.splice(i, 1, item);
                    } else {
                        // missing??
                        list.push(item);
                    }
                    break;
                case 'removed':
                    i = list.findIndex(x => x.id === item.id);
                    if (i !== -1) {
                        list.splice(i, 1);
                    } else {
                        // missing??
                        console.log('cannot delete', item);
                    }
                    break;
            }
        },
        // updateList: function(list, doc) {
        //     var item = doc.data();
        //     var i = list.findIndex(x => x.id === item.id);
        //     if (i !== -1) {
        //         list.splice(i, 1, item);
        //     } else {
        //         list.push(item);
        //     }
        // },
        createElection: function(nameOfAdmin) {
            var vue = this;
            if (!vue.dbUser) {
                return;
            }
            var ref = db.collection('elections').doc(); // generate new election doc
            ref.set({
                    created: new Date(),
                    by: nameOfAdmin,
                    focusPosition: ''
                }).then(function() {
                    vue.connectToElection(ref);

                    vue.createMembers(nameOfAdmin);
                    vue.createPositions();

                    vue.$emit('election-created');
                })
                .catch(function(err) {
                    console.log(err);
                    vue.$emit('election-creation-error', err);
                });
        },
        createMembers: function(nameOfAdmin) {
            var vue = this;
            // vue.members.splice(0, vue.members.length);

            var members = [];
            // debugger;

            var me = vue.makeMember(nameOfAdmin, members);
            me.isAdmin = true;
            me.connected = true;
            members.push(me);

            vue.dbUser.updateProfile({
                displayName: me.id
            });

            vue.me = me;

            // const dbMembers = vue.dbElectionRef.collection('members');
            // dbMembers.doc(me.id).set(me);

            for (var i = 0; i < 8; i++) {
                var member = vue.makeMember('', members);
                members.push(member);
                // dbMembers.doc(member.id).set(member);
            }

            const dbMembers = vue.dbElectionRef.collection('members');

            members.forEach(m => dbMembers.doc(m.id).set(m));
        },
        createPositions: function() {
            var vue = this;
            var list = [
                'Sample for Practice',
                'Chair',
                'Secretary',
                'Vice-Chair',
                'Treasurer'
            ];

            // vue.positions.splice(0, vue.positions.length);
            const dbPositions = vue.dbElectionRef.collection('positions');
            list.forEach((n, i) => {
                var position = this.makePosition(n);
                position.sortOrder = i * 10;
                // vue.positions.push(position);
                dbPositions.doc(position.id).set(position);
            });
        },
        // clearStorage: function() {
        //     localStorage.removeItem('members');
        //     localStorage.removeItem('positions');
        //     localStorage.removeItem('viewers');
        //     localStorage.removeItem('name');
        //     localStorage.removeItem('isViewer');
        //     localStorage.removeItem('isAdmin');
        //     this.myName = '';
        //     this.isViewer = false;
        //     this.isAdmin = false;
        //     this.fillData();
        // },
        fillData: function() {
            // var stored = localStorage['members'];
            // if (stored) {
            //     this.members = JSON.parse(stored);
            // } else {
            //     // temp
            //     this.members = [];
            //     this.members.push(this.makeMember("Glen"));
            //     this.members.push(this.makeMember("Joe"));
            //     this.members.push(this.makeMember("Mary", true, true));
            //     this.members.push(this.makeMember("Alexander"));
            //     this.members.push(this.makeMember("Sebastian"));
            //     this.members.push(this.makeMember("John"));
            //     this.members.push(this.makeMember("Sandy", true, false, true));
            //     this.members.push(this.makeMember("Marjorei"));
            //     this.members.push(this.makeMember("Natalie"));
            //     this.members.sort((a, b) => a.name < b.name ? -1 : 1);
            // }

            // stored = localStorage['positions'];
            // if (stored) {
            //     this.positions = JSON.parse(stored);
            // } else {
            //     this.positions = [];
            //     this.positions.push(this.makePosition('Practice Vote'));
            //     this.positions.push(this.makePosition('Chair'));
            //     this.positions.push(this.makePosition('Secretary'));
            //     this.positions.push(this.makePosition('Vice-Chair'));
            //     this.positions.push(this.makePosition('Treasurer'));
            // }

            // stored = localStorage['viewers'];
            // if (stored) {
            //     this.viewers = JSON.parse(stored);
            // } else {
            //     this.viewers = [];
            // }
        },
        makePosition: function(name) {
            var id = this.getRandomId('p', this.positions);
            return {
                name: name,
                id: id,
                elected: null,
                rounds: [],
                isActive: false
            }
        },
        getRandomId: function(prefix, list) {
            var uniqueIdFound = false;
            var id;
            while (!uniqueIdFound) {
                id = prefix + Math.random().toString().substring(3, 6);
                uniqueIdFound = !list.find(m => m.id === id);
            }
            return id;
        },
        makeMember: function(name, list) {
            var id = this.getRandomId('m', list);
            return {
                name: name || '',
                id: id,
                isAdmin: false,
                connected: false,

                // temp per position vote
                preferNot: false,
                voted: false,
                voting: false,
                symbol: '',
            };
        },
        startMeAsViewer: function() {
            var last = this.viewers.length ? this.viewers[this.viewers.length - 1].code : null;
            var nextNum = last ? last.charCodeAt(0) + 1 : 65;
            var id = String.fromCharCode(nextNum);
            this.isViewer = true;
            this.viewers.push({
                id: id
            });
        }
    }
});