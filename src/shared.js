import Vue from 'vue';

export default new Vue({
    data: {
        members: [],
        myName: '',
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
    },
    methods: {
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