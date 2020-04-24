import Vue from 'vue';
import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/database'
import firebaseDb from './firebaseInit'

export default new Vue({
    data: {
        election: {},
        electionLoadAttempted: false,
        me: {},
        // currentVoting: {},
        // isViewer: false,
        // isAdmin: false,
        members: [],
        positions: [],
        viewers: [],
        rounds: [],
        dbUser: null,
        confirmedVote: false,
        disconnecting: false,
        dbElectionRef: null,
        initialQuery: '',
        symbol: '',
        justClaimed: '',
        electionKey: ''
    },
    computed: {
        myIdFromProfile: function() {
            return this.dbUser && this.dbUser.displayName;
        },
        numBlankNames: function() {
            return this.members.filter(m => !m.name).length;
        },
        numNonBlankNames: function() {
            return this.members.filter(m => m.name).length;
        },
        numMembers: function() {
            return this.members.length;
        },
        numVotesRequired: function() {
            return 1 + Math.floor(this.numMembers / 2);
        },
        isMember: function() {
            var id = this.me.id;
            return id && id.startsWith('m');
        },
        isViewer: function() {
            var id = this.me.id;
            return id && id.startsWith('v');
        },
        link: function() {
            if (this.dbUser && this.electionKey) {
                return `${location.origin}/j?${this.electionKey}`;
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
            var id = this.me.id;
            if (!id) return {};

            switch (id[0]) {
                case 'm':
                    return firebaseDb.ref(`members/${this.electionKey}/${this.me.id}`);

                case 'v':
                    return firebaseDb.ref(`viewers/${this.electionKey}/${this.me.id}`);
            }

            return {};
        }
    },
    watch: {},
    created: function() {
        var vue = this;
        vue.handleAuthChanges();
        vue.initialQuery = window.location.search;
    },
    methods: {
        symbolOffset: function(letter) {
            if (!letter) {
                return 0;
            }
            var num = letter.charCodeAt(0) - 65;
            return num * 34; // offsets in sprite
        },
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
            // console.log('connected to election', electionRef.key);
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

            vue.watchForListChanges(vue.members, firebaseDb.ref('members/' + vue.electionKey).orderByChild('name'), (member, rawData) => {
                if (member.id === vue.myIdFromProfile || member.id === vue.justClaimed) {
                    vue.justClaimed = null;

                    if (vue.me.id) {
                        // my member info has been updated
                        vue.me = member;
                    } else if (vue.disconnecting) {
                        vue.disconnecting = false;
                    } else {
                        vue.claimMember(member.id);
                    }
                }

                if (!member.id && member.connected === false) {
                    // an orphaned member that is recreated by the functions... need to clean this up
                    rawData.ref.remove();
                }
            }, (deletedMember, rawData) => {
                if (deletedMember.id === vue.myIdFromProfile || (vue.dbUser && deletedMember.id === vue.dbUser.displayName) || deletedMember.id === vue.justClaimed) {
                    // my member info has been removed
                    vue.logout();
                }
                if (!deletedMember.id && deletedMember.connected === false) {
                    // an orphaned member that is recreated by the functions... need to clean this up
                    rawData.ref.remove();
                }
            });

            vue.watchForListChanges(vue.positions, firebaseDb.ref('positions/' + vue.electionKey).orderByChild('sortOrder'), position => {
                vue.positions.sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1);
            });
            vue.watchForListChanges(vue.viewers, firebaseDb.ref('viewers/' + vue.electionKey).orderByChild('id'), viewer => {
                // console.log('my id', vue.myIdFromProfile, ' test viewer id', viewer.id);
                if (viewer.id === vue.myIdFromProfile) {
                    if (vue.me.id) {
                        // my viewer info has been updated (not likely used)
                        vue.me = viewer;
                    } else {
                        vue.claimViewer(viewer.id);
                    }
                }
            });
            vue.watchForListChanges(vue.rounds, firebaseDb.ref('votingRounds/' + vue.electionKey).orderByChild('id'));

            electionRef.update({
                // record when this election was last used
                lastLogin: new Date()
            });

            electionRef.on('value', function(snapshot) {
                var incomingElection = snapshot.val() || {};

                // console.log('election changed', incomingElection);
                if (!incomingElection || !incomingElection.createdBy) {
                    // deleted!
                    vue.logout();
                    return;
                }

                if (!incomingElection.votingOpen && vue.dbMe.update) { // vue.election.votingOpen &&
                    // voting in this round just closed
                    vue.dbMe.update({
                        voting: false,
                        voted: false
                    });
                }

                if (incomingElection.votingOpen && !vue.election.votingOpen) {
                    vue.symbol = '';
                }

                vue.election = incomingElection;

                vue.electionLoadAttempted = true;
                // console.log('election-changed');
                vue.$emit('election-changed');
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
            location.href = "../";
        },
        cancelVoting: function() {
            firebaseDb.ref(`elections/${this.electionKey}`).update({
                votingOpen: false
            });
        },
        watchForListChanges: function(localList, listRef, onAddChange, onRemove) {
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
        claimMember: function(memberId) {
            var vue = this;
            // console.log('set connected', this.dbUser.uid);
            vue.me = vue.members.find(m => m.id === memberId);

            vue.justClaimed = memberId;

            firebaseDb.ref(`members/${vue.electionKey}/${memberId}`).update({
                connected: vue.dbUser.uid,
                connectedTime: firebase.database.ServerValue.TIMESTAMP
            });

            vue.dbUser.updateProfile({
                displayName: memberId
            });

            vue.firebaseDbMyStatus
                .set({
                    status: 'online',
                    electionKey: vue.electionKey,
                    memberId: memberId
                });

            // start watching for symbols to be assigned to me
            var path = `voterSymbols/${this.electionKey}/${memberId}`;
            // console.log('watch', path);
            firebaseDb.ref(path)
                .on('value', function(snapshot) {
                    var info = snapshot.val();
                    if (info) {
                        vue.symbol = info.symbol;
                    } else {
                        vue.symbol = '';
                    }
                })
        },
        claimViewer: function(viewerId) {
            this.me = this.viewers.find(v => v.id === viewerId);

            if (this.me.id) {
                firebaseDb.ref(`viewers/${this.electionKey}/${viewerId}`).update({
                    connected: this.dbUser.uid,
                    connectedTime: firebase.database.ServerValue.TIMESTAMP
                });

                this.dbUser.updateProfile({
                    displayName: viewerId
                });
            } else {
                console.log('Did not find viewer', viewerId);
            }
        },
        startMeAsViewer: function() {
            var id = this.getRandomId('v', this.viewers);
            var lastName = this.viewers.length ? this.viewers[this.viewers.length - 1].name : null;
            // can handle 26 viewers... should not have more than 1 or 2
            var nextNum = lastName ? +lastName.substr(1) : 0;
            var name = 'V' + (1 + nextNum);
            var viewer = {
                id: id,
                name: name
            };

            firebaseDb.ref(`viewers/${this.electionKey}/${id}`).set(viewer);

            this.claimViewer(id);
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

                    vue.claimMember(vue.me.id);

                    vue.$emit('election-created');
                })
                .catch(function(err) {
                    console.log(err);
                    vue.$emit('election-creation-error', err);
                });
        },
        createMembers: function(nameOfAdmin) {
            var vue = this;

            var members = [];

            var me = vue.makeMember(nameOfAdmin, members);
            me.isAdmin = true;
            // me.connected = this.dbUser.uid;
            // me.connectedTime = firebase.database.ServerValue.TIMESTAMP;
            members.push(me);

            vue.dbUser.updateProfile({
                displayName: me.id
            });
            vue.me = me;

            // default to 5 members
            for (var i = 0; i < 4; i++) {
                var member = vue.makeMember('', members);
                members.push(member);
                // dbMembers.doc(member.id).set(member);
            }
            members.forEach(m => firebaseDb.ref(`members/${this.electionKey}/${m.id}`).set(m));
        },
        createPositions: function() {
            // var vue = this;
            var list = [
                'Sample',
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

            positions.forEach(p => firebaseDb.ref(`positions/${this.electionKey}/${p.id}`).set(p));
        },
        fillData: function() {},
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
        }
    }
});