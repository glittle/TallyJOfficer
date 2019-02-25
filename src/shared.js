import Vue from 'vue';
import db from './firebaseInit'

export default new Vue({
    data: {
        electionId: localStorage['electionId'] || null,
        electionLoadAttempted: false,
        myName: localStorage['name'] || '',
        isViewer: localStorage['isViewer'] === 'true',
        isAdmin: localStorage['isAdmin'] === 'true',
        members: [],
        positions: [],
        viewers: [],
        dbElectionRef: null,
        firebaseId: null
    },
    computed: {},
    watch: {
        myName: function() {
            localStorage['name'] = this.myName;
        },
        isViewer: function() {
            localStorage['isViewer'] = this.isViewer;
        },
        isAdmin: function() {
            localStorage['isAdmin'] = this.isAdmin;
        },
        members: {
            handler: function(a, b) {
                var dbList = this.dbElectionRef.collection('members');
                this.members.forEach(m => dbList.doc(m.id).set(m, {
                    merge: true
                }));
            },
            deep: true
        },
        viewers: {
            handler: function(a, b) {
                var dbList = this.dbElectionRef.collection('viewers');
                this.viewers.forEach(v => dbList.doc(v.id).set(v, {
                    merge: true
                }));
            },
            deep: true
        },
        positions: {
            handler: function(a, b) {
                var dbList = this.dbElectionRef.collection('positions');
                this.positions.forEach(p => dbList.doc(p.id).set(p, {
                    merge: true
                }));
            },
            deep: true
        }
    },
    created: function() {
        var vue = this;
        if (this.electionId) {

            var ref = db.collection('elections').doc(this.electionId);
            ref.get()
                .then(function(doc) {
                    if (doc.exists) {
                        vue.dbElectionRef = ref;

                        var election = doc.data();

                        vue.members = election.members;
                        vue.viewers = election.viewers;
                        vue.positions = election.positions;

                        vue.$emit('election-loaded');

                        ref.update({
                            lastLogin: new Date()
                        });
                    } else {
                        vue.electionId = null;
                        vue.dbElectionRef = null;
                    }
                    vue.electionLoadAttempted = true;
                }).catch(function(err) {
                    console.log(err);
                });
        } else {
            vue.electionLoadAttempted = true;
        }

        this.fillData();
    },
    methods: {
        createElection: function(nameOfAdmin) {
            var vue = this;
            var ref = db.collection('elections').doc(); // generate new election doc
            ref.set({
                    created: new Date(),
                    by: nameOfAdmin
                }).then(function() {
                    vue.dbElectionRef = ref;
                    vue.electionId = ref.id;
                    localStorage.electionId = vue.electionId;

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
            vue.members.splice(0, vue.members.length);

            var me = vue.makeMember(nameOfAdmin);
            me.isMe = true;
            me.isAdmin = true;
            me.connected = true;
            vue.members.push(me);

            // const dbMembers = vue.dbElectionRef.collection('members');
            // dbMembers.doc(me.id).set(me);

            for (var i = 0; i < 8; i++) {
                var member = vue.makeMember();
                vue.members.push(member);
                // dbMembers.doc(member.id).set(member);
            }
        },
        createPositions: function() {
            var vue = this;
            var list = [
                'Practice Vote',
                'Chair',
                'Secretary',
                'Vice-Chair',
                'Treasurer'
            ];
            debugger;

            vue.positions.splice(0, vue.positions.length);
            // const dbPositions = vue.dbElectionRef.collection('positions');
            list.forEach(n => {
                var position = this.makePosition(n);
                vue.positions.push(position);
                // dbPositions.doc(position.id).set(position);
            });
        },
        clearStorage: function() {
            localStorage.removeItem('members');
            localStorage.removeItem('positions');
            localStorage.removeItem('viewers');
            localStorage.removeItem('name');
            localStorage.removeItem('isViewer');
            localStorage.removeItem('isAdmin');
            this.myName = '';
            this.isViewer = false;
            this.isAdmin = false;
            this.fillData();
        },
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
        makeMember: function(name, connected, voted, voting) {
            var id = this.getRandomId('m', this.members);
            return {
                name: name || '',
                id: id,
                isMe: false,
                isAdmin: false,
                preferNot: false,
                symbol: '',
                connected: connected || false,
                voted: voted || false,
                voting: voting || false,
            };
        },
        startMeAsViewer: function() {
            var last = this.viewers.length ? this.viewers[this.viewers.length - 1].code : null;
            var nextNum = last ? last.charCodeAt(0) + 1 : 65;
            var id = String.fromCharCode(nextNum);
            this.isViewer = true;
            this.myName = id;
            this.viewers.push({
                id: id
            });
        }
    }
});