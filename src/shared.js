import Vue from 'vue';

export default new Vue({
    data: {
        electionCode: '234e2a92e2',
        myName: localStorage['name'] || '',
        isViewer: localStorage['isViewer'] === 'true',
        isAdmin: localStorage['isAdmin'] === 'true',
        members: [],
        positions: [],
        viewers: []
    },
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
                localStorage['members'] = JSON.stringify(this.members);
            },
            deep: true
        },
        viewers: {
            handler: function(a, b) {
                localStorage['viewers'] = JSON.stringify(this.viewers);
            },
            deep: true
        },
        positions: {
            handler: function(a, b) {
                localStorage['positions'] = JSON.stringify(this.positions);
            },
            deep: true
        }
    },
    created: function() {
        this.fillData();
    },
    methods: {
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
            var stored = localStorage['members'];
            if (stored) {
                this.members = JSON.parse(stored);
            } else {
                // temp
                this.members = [];
                this.members.push(this.makeMember("Glen"));
                this.members.push(this.makeMember("Joe"));
                this.members.push(this.makeMember("Mary", true, true));
                this.members.push(this.makeMember("Alexander"));
                this.members.push(this.makeMember("Sebastian"));
                this.members.push(this.makeMember("John"));
                this.members.push(this.makeMember("Sandy", true, false, true));
                this.members.push(this.makeMember("Marjorei"));
                this.members.push(this.makeMember("Natalie"));
                this.members.sort((a, b) => a.name < b.name ? -1 : 1);
            }

            stored = localStorage['positions'];
            if (stored) {
                this.positions = JSON.parse(stored);
            } else {
                this.positions = [];
                this.positions.push(this.makePosition('Practice Vote'));
                this.positions.push(this.makePosition('Chair'));
                this.positions.push(this.makePosition('Secretary'));
                this.positions.push(this.makePosition('Vice-Chair'));
                this.positions.push(this.makePosition('Treasurer'));
            }

            stored = localStorage['viewers'];
            if (stored) {
                this.viewers = JSON.parse(stored);
            } else {
                this.viewers = [];
            }
        },
        makePosition: function(name) {
            return {
                name: name,
                elected: null,
                rounds: [],
                isActive: false
            }
        },
        makeMember: function(name, connected, voted, voting) {
            return {
                name: name,
                isMe: false,
                preferNot: false,
                symbol: '',
                connected: connected || false,
                voted: voted || false,
                voting: voting || false
            };
        },
        startMeAsViewer: function() {
            var last = this.viewers.length ? this.viewers[this.viewers.length - 1].code : null;
            var nextNum = last ? last.charCodeAt(0) + 1 : 65;
            var code = String.fromCharCode(nextNum);
            this.isViewer = true;
            this.myName = code;
            this.viewers.push({
                code: code
            });
        }
    }
});