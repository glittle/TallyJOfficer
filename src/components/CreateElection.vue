<template>
    <div class="CreateElection">
        <div v-if="!shared.election.id">
            <div class="panel">
                <h1>TallyJ for Officers</h1>
                <p>Welcome to your new officer election!</p>
                <p>
                    You are creating a new election that will assist your team
                    as you elect its officers.
                </p>
                <p>
                    <strong>Please note</strong>: if you are trying to join an
                    existing election, you must use the link given to you by the
                    person who created it.
                </p>
            </div>
            <div class="panel">
                <h1>Create an Election</h1>
                <p>To get started, all we need is your first name.</p>
                <p>
                    Please enter the name that you want other members to use
                    when talking with you, usually just your first name. (You
                    can change it later, if needed.)
                </p>
                <div class="nameInput">
                    Your first name:
                    <input v-model="name" v-on:keyup.enter="create" />
                </div>

                <div>
                    <button
                        :disabled="!name"
                        v-on:click="create"
                        v-text="
                            'Create the Election ' +
                                (name ? 'Now' : '(enter your name)')
                        "
                    ></button>
                </div>
                <p>
                    You will be the "administrator" of this election and able to
                    manage it in this system.
                </p>
                <p>
                    When the election is created, you will be given a special
                    private address that you will need to share with the rest of
                    the team members.
                </p>
                <p>
                    Here are the
                    <a href="/faq">Questions and Answers</a> (again) about how
                    this website works.
                </p>
                <p class="leave">
                    <button class="notUsual" v-on:click="leave">
                        Cancel
                    </button>
                </p>
            </div>
            <div v-if="previousElections.length" class="panel">
                <h1>Your Previous Elections on This Computer</h1>
                <div class="electionsList">
                    <table class="previousElections">
                        <tr
                            v-for="g in previousElections"
                            :key="g.key"
                            class="previousElection"
                        >
                            <td>
                                <button
                                    v-on:click="shared.loadElection(g.key)"
                                    :title="g.abbrev"
                                >
                                    Open
                                </button>
                            </td>
                            <td>
                                <div class="age" :title="g.ageDate">
                                    Viewed {{ g.age }}
                                </div>
                                <div
                                    v-if="g.createdAge"
                                    :title="g.createdDate"
                                    class="age"
                                >
                                    Created {{ g.createdAge }}
                                </div>
                            </td>
                            <td class="who">
                                <span>Voters: </span>
                                {{ g.who }}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <div v-else class="loading">
            Loading...
        </div>
    </div>
</template>

<script>
import * as moment from "moment/moment";

export default {
    name: "CreateElection",
    components: {},
    data: function() {
        return {
            name: ""
        };
    },
    computed: {
        shared: function() {
            return this.$root.shared;
        },
        previousElections() {
            var elections = this.shared.myOldElections;
            if (elections) {
                var list = Object.keys(elections).map(k => {
                    var info = elections[k];
                    if (typeof info === "string") {
                        // old/buggy data
                        info = {
                            when: info
                        };
                    }
                    info.key = k;
                    if (info.created) {
                        moment.suppressDeprecationWarnings = true;
                        info.createdAge = moment(info.created).fromNow();
                        info.createdDate = moment(info.created).format();
                        moment.suppressDeprecationWarnings = false;
                    }
                    info.age = moment(info.when).fromNow();
                    info.ageDate = moment(info.when).format();
                    info.abbrev = this.shared.electionKeyAbbrev(k);
                    return info;
                });
                list.sort((a, b) => {
                    return a.when < b.when ? 1 : -1; // oldest first
                });
                return list;
            }
            return [];
        }
    },
    beforeUpdate: function() {
        if (this.shared.election.created) {
            this.$router.replace("/e");
        }
    },
    mounted: function() {
        if (this.shared.election.created) {
            this.$router.replace("/e");
            return;
        }

        this.shared.$on("election-created", this.electionCreated);
        this.shared.$on("election-changed", this.goHome);
    },
    beforeDestroy: function() {
        this.shared.$off("election-created", this.electionCreated);
        this.shared.$off("election-changed", this.goHome);
    },
    methods: {
        goHome: function() {
            if (this.$route.path !== "/e") {
                this.$router.replace("/e");
            }
        },
        electionCreated: function() {
            var vue = this;
            if (vue.shared.members.filter(m => m.name).length < 2) {
                vue.$router.replace("/e/admin");
                return;
            }
            vue.$router.replace("/e");
        },
        create: function() {
            if (this.name) {
                this.shared.createElection(this.name);
            }
        },
        leave: function() {
            this.$router.replace("/");
        }
    }
};
</script>

<style lang="less">
.CreateElection {
    text-align: left;
    // padding: 0 0 0 15px;
    // max-width: 700px;
    padding: 0 10px;
    // margin: 0 auto;

    .nameInput {
        margin: 0 0 1em;
        input {
            width: 60px;
        }
    }
    .loading {
        margin: 50px auto;
        text-align: center;
        font-size: 1.1em;
    }
    .leave {
        margin-top: 50px;
    }
    .electionsList {
        max-height: 50vh;
        overflow: auto;
    }
    .previousElections {
        td {
            padding: 3px 5px 0 0;
            vertical-align: top;
        }
        .name {
            font-weight: bold;
        }
        .age {
            color: #666;
            font-size: 85%;
            white-space: nowrap;
        }
        .who {
            span {
                color: #999;
            }
        }
    }
}
</style>
