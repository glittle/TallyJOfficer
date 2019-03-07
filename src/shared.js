import Vue from 'vue';
import firebase from 'firebase'
import firebaseDb from './firebaseInit'

export default new Vue({
    data: {
        election: {},
        electionLoadAttempted: false,
        me: {},
        // currentVoting: {},
        isViewer: false,
        // isAdmin: false,
        members: [],
        positions: [],
        viewers: [],
        rounds: [],
        dbUser: null,
        dbElectionRef: null,
        initialQuery: '',
        symbol: '',
        electionKey: '',
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
        numVotesRequired: function() {
            return 1 + Math.floor(this.numMembers / 2);
        },
        link: function() {
            if (this.dbUser) {
                return `${location.origin}/e?${this.electionKey}`;
            }
            return null;
        },
        firebaseDbMyStatus: function() {
            if (this.dbUser) {
                return firebaseDb.ref('/users/' + this.dbUser.uid);
            }
            return null;
        },
        dbMe: function() {
            return firebaseDb.ref(`members/${this.electionKey}/${this.me.id}`);
        }
    },
    watch: {
        // 'election.positionIdToVoteFor': function () {
        //     this.me.voted = false;
        //     this.me.voting = false;
        // },
        // 'election.votingOpen': function(a, b) {
        //     // when opened or closed, clear my settings
        //     firebaseDb.ref(`members/${this.electionKey}/${this.me.id}`).update({
        //         voting: false,
        //         voted: false
        //     });
        // }
    },
    created: function() {
        var vue = this;
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
                    vue.dbUser = null;
                    // vue.dbElectionRef = null;
                }
                // ...
            });

            firebase.auth().signInAnonymously().catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log('login error', errorCode, errorMessage)
            });

            firebaseDb.ref('.info/connected')
                .on('value', function(snapshot) {
                    if (!snapshot.val()) {
                        return; // we are not connected yet
                    };

                    var updates = {};
                    updates['status'] = 'offline';

                    // gtag('event', 'login')

                    if (vue.firebaseDbMyStatus) {
                        vue.firebaseDbMyStatus
                            .onDisconnect()
                            .update(updates);
                    }
                });
        },
        loadElection: function(electionKey) {
            var vue = this;
            if (electionKey) {
                var electionRef = firebaseDb.ref('elections/' + electionKey);
                electionRef.once('value')
                    .then(snapshot => {
                        if (snapshot.exists()) {
                            // only connect if we know it exists
                            vue.connectToElection(electionRef);
                        } else {
                            vue.dbUser.updateProfile({
                                photoURL: null
                            });
                            vue.electionLoadAttempted = true;
                        }
                    });
                // .once('value').then(snapshot => {
                //         var election = snapshot.val();
                //         // } else {
                //         //     // invalid, so forget about it
                //         //     vue.dbUser.updateProfile({
                //         //         photoURL: '',
                //         //         displayName: ''
                //         //     });

                //         vue.electionLoadAttempted = true;
                //     })
                // vue.dbElectionRef = null;
                // }
                // }).catch(function(err) {
                //     vue.dbUser.updateProfile({
                //         photoURL: '',
                //         displayName: ''
                //     });
                //     vue.electionLoadAttempted = true;
                //     console.log(err);
                // });
            }
        },
        connectToElection: function(electionRef) {
            // we know that ref refers to an actual db entry
            var vue = this;
            vue.dbElectionRef = electionRef;
            vue.electionKey = electionRef.key;
            vue.dbUser.updateProfile({
                photoURL: electionRef.key
            });

            vue.firebaseDbMyStatus
                .set({
                    status: 'online',
                    electionKey: vue.electionKey,
                    memberId: vue.myIdFromProfile
                });

            vue.watchForListChanges(vue.members, firebaseDb.ref('members/' + vue.electionKey).orderByChild('name'), member => {
                if (member.id === vue.myIdFromProfile) {
                    if (vue.me.id) {
                        // my member info has been updated
                        vue.me = member;
                    } else {
                        vue.claimMember(member.id);
                    }
                }
            });

            vue.watchForListChanges(vue.positions, firebaseDb.ref('positions/' + vue.electionKey).orderByChild('sortOrder'));
            vue.watchForListChanges(vue.viewers, firebaseDb.ref('viewers/' + vue.electionKey).orderByChild('id'));
            vue.watchForListChanges(vue.rounds, firebaseDb.ref('votingRounds/' + vue.electionKey).orderByChild('id'));

            electionRef.update({
                // record when this election was last used
                lastLogin: new Date()
            });

            electionRef.on('value', function(snapshot) {
                var incomingElection = snapshot.val() || {};

                if (vue.election.votingOpen && !incomingElection.votingOpen) {
                    // voting in this round just closed
                    vue.dbMe.update({
                        voting: false,
                        voted: false
                    });
                }

                console.log('election changed', incomingElection);
                if (!incomingElection || !incomingElection.createdBy) {
                    // deleted!
                    vue.logout();
                    return;
                }

                vue.election = incomingElection;

                vue.electionLoadAttempted = true;
                vue.$emit('election-loaded');
            });

            // vue.firebaseDbMyStatus
            //     .on('value', function(snapshot) {
            //         const info = snapshot.val();
            //         if (info) {
            //             vue.symbol = info.symbol || '';
            //             console.log('incoming symbol 1', vue.symbol || 'n/a');
            //         } else {
            //             // console.log('no symbol info');
            //         }
            //     });

            // firebaseDb.ref(`voting/${this.electionKey}/votes`)
            //     .on('value', function(snapshot) {
            //         vue.currentVoting = snapshot.val() || {};
            //     });
        },
        logout: function() {
            this.electionKey = "";
            this.me = {};
            this.dbUser.updateProfile({
                photoURL: "",
                displayName: ""
            });
            this.dbElectionRef = null;
            // this.$root.$router.replace("/");
            location.reload(); // force a new page to load
        },
        watchForListChanges: function(localList, listRef, onAddChange) {
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
                    onAddChange(item);
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
                    onAddChange(item);
                }
            });

            listRef.on('child_removed', data => {
                var item = data.val();
                i = localList.findIndex(x => x.id === item.id);
                if (i !== -1) {
                    localList.splice(i, 1);
                } else {
                    // missing??
                    console.log('cannot delete', item);
                }
            });
        },
        claimMember: function(memberId) {
            var vue = this;
            // console.log('set connected', this.dbUser.uid);
            vue.me = vue.members.find(m => m.id === memberId);

            firebaseDb.ref(`members/${this.electionKey}/${memberId}`).update({
                connected: this.dbUser.uid,
                connectedTime: firebase.database.ServerValue.TIMESTAMP
            });

            // get my symbol now and keep watching
            var path = `voterSymbols/${this.electionKey}/${memberId}`;
            // console.log('watch', path);
            firebaseDb.ref(path)
                .on('value', function(snapshot) {
                    var info = snapshot.val();
                    if (info) {
                        vue.symbol = info.symbol;
                        console.log('incoming symbol 2', vue.symbol || 'n/a');
                    } else {
                        // console.log('no symbol info');
                    }
                })
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
            var electionRef = firebaseDb.ref('elections').push(); // generate new election doc
            electionRef.set({
                    created: new Date().toString(),
                    createdBy: nameOfAdmin
                        // focusPosition: ''
                }).then(function() {
                    vue.connectToElection(electionRef);

                    vue.createMembers(nameOfAdmin);
                    vue.createPositions();

                    gtag('event', 'createElection');

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
            me.connected = this.dbUser.uid;
            me.connectedTime = firebase.database.ServerValue.TIMESTAMP;
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
            members.forEach(m => firebaseDb.ref(`members/${this.electionKey}/${m.id}`).set(m));

            // const dbMembers = vue.dbElectionRef.collection('members');
            // members.forEach(m => firebaseDb.ref('members/' +  dbMembers.doc(m.id).set(m));
        },
        createPositions: function() {
            // var vue = this;
            var list = [
                'Sample',
                'Chair',
                'Secretary',
                'Vice-Chair',
                'Treasurer'
            ];
            var positions = [];
            list.forEach((n, i) => {
                var position = this.makePosition(n, positions);
                position.sortOrder = i;
                positions.push(position);
            });

            positions.forEach(p => firebaseDb.ref(`positions/${this.electionKey}/${p.id}`).set(p));

            // const dbPositions = vue.dbElectionRef.collection('positions');
            // positions.forEach(p => dbPositions.doc(p.id).set(p));
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
        makePosition: function(name, list) {
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
        getRandomId: function(prefix, list, numDigits) {
            var uniqueIdFound = false;
            var id;
            numDigits = numDigits || 3;
            while (!uniqueIdFound) {
                id = prefix + Math.random().toString().substr(3, numDigits);
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
                participating: true,

                // temp per position vote
                preferNot: false,
                voted: false,
                voting: false
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