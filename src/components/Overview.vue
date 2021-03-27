<template>
    <div class="Overview">
        <div
            v-if="
                shared.me.isAdmin ||
                    shared.isViewer ||
                    !shared.election.votingOpen
            "
            id="positionsToFill"
            class="positionsToFill panel"
        >
            <h1 v-text="$t('positions.title')"></h1>
            <div v-if="shared.enableLanguage">
                {{ $i18n.locale }}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Who is elected</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tr
                    v-for="p in shared.positions"
                    :key="p.name"
                    class="positionHolder"
                    :class="{ isActive: p.id === viewedPositionId }"
                >
                    <td>{{ p.name }}</td>
                    <td>
                        <span v-text="nameOf(p.electedId) || '-'"></span>
                    </td>
                    <td class="positionBtns">
                        <!-- <button
              class="primary"
              v-if="shared.me.isAdmin"
              v-on:click="select(p)"
            >Select for Voting</button>-->
                        <button
                            v-if="
                                !shared.election.votingOpen || shared.isViewer
                            "
                            v-on:click="view(p)"
                        >
                            View
                        </button>
                    </td>
                </tr>
            </table>

            <p v-if="shared.me.isAdmin" class="adminBtns">
                <button
                    v-if="viewedPosition && !shared.election.votingOpen"
                    class="primary"
                    v-on:click="openVoting"
                >
                    Admin: Start a round of voting for {{ viewedPosition.name }}
                </button>
                <button
                    v-if="shared.election.votingOpen"
                    class="caution"
                    v-on:click="resetVoting"
                >
                    Admin: Cancel Voting
                </button>
            </p>
        </div>

        <!-- <button v-on:click="gotoVotePanel">Cast my Vote</button> -->
        <voting-panel v-if="shared.isMember" />

        <result-panel />
    </div>
</template>

<script>
import ResultPanel from "./ResultPanel.vue";
import VotingPanel from "./VotingPanel.vue";
import firebaseDb from "../firebaseInit";

export default {
    name: "Overview",
    components: {
        ResultPanel,
        VotingPanel
    },
    data: function() {
        return {
            viewedPosition: null
        };
    },
    computed: {
        shared: function() {
            return this.$root.shared;
        },
        viewedPositionId: function() {
            return (this.viewedPosition && this.viewedPosition.id) || 0;
        }
    },
    watch: {
        "shared.election.positionIdToVoteFor": function(a, b) {
            this.syncToPosition();
        }
    },
    mounted: function() {
        //  console.log('mounted overview');
        this.syncToPosition();
    },
    methods: {
        syncToPosition: function() {
            var vue = this;
            vue.viewedPosition = vue.shared.positions.find(
                p => p.id === vue.shared.election.positionIdToVoteFor
            );
        },
        openVoting: function() {
            // change for everyone
            var positionIdToOpen = this.viewedPosition.id;

            firebaseDb
                .ref(`/elections/${this.shared.electionKey}`)
                .update({ positionIdToVoteFor: "" });

            // do twice, in case we've made a local change
            firebaseDb
                .ref(`/elections/${this.shared.electionKey}`)
                .update({ positionIdToVoteFor: positionIdToOpen });

            // create as many slots for votes as we need, skip by a random number to be less predicable
            var participants = this.shared.members.filter(m => m.participating);
            var numParticipants = participants.length;
            var randomSpread = 26 / numParticipants;

            // prepare a list of vote slots, one for each member who is participating (doesn't matter which member for each)
            var nextLetter = 64;
            var voteDict = {};
            participants.forEach((m, i) => {
                nextLetter += 1 + Math.random() * randomSpread;
                voteDict[String.fromCharCode(nextLetter)] = "";
            });

            // save the vote slots
            firebaseDb.ref(`/voting/${this.shared.electionKey}`).set({
                positionId: positionIdToOpen,
                votes: voteDict
            });

            // turn on voting
            firebaseDb.ref(`/elections/${this.shared.electionKey}`).update({
                votingOpen: true
            });
        },
        resetVoting: function() {
            // turn off voting
            this.shared.cancelVoting();
        },
        view: function(position) {
            this.viewedPosition = position;
            this.shared.election.positionIdToVoteFor = position.id;
        },
        gotoVotePanel: function() {
            this.$router.replace("/e/votingPanel");
        },
        nameOf: function(id) {
            if (!id) return "";
            var member = this.shared.members.find(m => m.id === id);
            if (!member) return "";
            return member.name;
        }
    }
};
</script>

<style lang="less">
.Overview {
    max-width: 700px;
    margin: 0 auto;
    padding: 0 10px;
    .positionsToFill {
        table {
            margin: 1em auto 0;
            border-collapse: collapse;
            thead {
                border-bottom: 1px solid gray;
            }
            td {
                width: 200px;
                line-height: 2.3em;
                white-space: nowrap;
                button {
                    vertical-align: baseline;
                    margin: 0 0.8em;
                }
            }
            tr.positionHolder {
                &.isActive {
                    background-color: #9fef93;
                }
            }
        }
    }
    .reset {
        margin: 100px 0 10px 0;
    }

    .positionBtns {
        button {
            margin: 0 10px;
        }
    }
    .adminBtns {
        button {
            margin: 0 10px;
        }
    }

    .symbol {
        background-image: url("../../public/img/symbols40.png");
        width: 40px;
        height: 34px;
        margin: 3px auto;
        opacity: 0.5;
    }
}
</style>
