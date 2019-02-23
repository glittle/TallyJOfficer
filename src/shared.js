import Vue from 'vue';

export default new Vue({
    data: {
        myName: '',
        isAdmin: true,
        members: [],
        positions: [],
        viewers: [{
            code: 'A'
        }]
    },
    created: function() {
        // temp
        this.members.push(this.makeMember("Glen", true));
        this.members.push(this.makeMember("Joe"));
        this.members.push(this.makeMember("Mary", true, true));
        this.members.push(this.makeMember("Alexander"));
        this.members.push(this.makeMember("Sebastian"));
        this.members.push(this.makeMember("John"));
        this.members.push(this.makeMember("Sandy", true, false, true));
        this.members.push(this.makeMember("Marjorei"));
        this.members.push(this.makeMember("Natalie"));
        this.members.sort((a, b) => a.name < b.name ? -1 : 1);

        this.positions.push(this.makePosition('Chair'));
        this.positions.push(this.makePosition('Secretary'));
        this.positions.push(this.makePosition('Vice-Chair'));
        this.positions.push(this.makePosition('Treasurer'));
    },
    methods: {
        makePosition: function(name) {
            return {
                name: name,
                elected: ''
            }
        },
        makeMember: function(name, connected, voted, voting) {
            return {
                name: name,
                isMe: false,
                connected: connected || false,
                voted: voted || false,
                voting: voting || false
            };
        }
    }
});