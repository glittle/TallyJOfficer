<template>
    <div
        v-if="position && (shared.election.votingOpen || shared.confirmedVote)"
        class="VotingPanel panel"
    >
        <a name="voteTop"></a>
        <h1>Voting for {{ positionName }}</h1>

        <div v-if="!shared.symbol" class="pending">
            Preparing ballots...
        </div>
        <div v-else>
            <div>
                <div
                    v-if="
                        shared.isMember &&
                            shared.election.votingOpen &&
                            shared.election.showPreferNot
                    "
                    class="choosePreferNot"
                >
                    <label>
                        <input v-model="preferNot" type="checkbox" />
                        I have a good reason why I should not be elected as
                        {{ positionName }}.
                    </label>
                </div>

                <table v-if="!shared.confirmedVote && shared.isMember">
                    <tr
                        v-for="m in shared.members"
                        :key="m.id"
                        class="memberHolder"
                        :class="{ preferNot: m.preferNot }"
                    >
                        <td>
                            <button
                                class="vote"
                                :class="{
                                    selected: selectedMember.name === m.name,
                                    selectionMade: selectedMember
                                }"
                                v-on:click="voteFor(m)"
                            >
                                {{ m.name }}
                                <span
                                    v-if="alreadyIn(m)"
                                    class="alreadyIn"
                                    v-text="alreadyIn(m)"
                                ></span>
                            </button>
                            <div
                                v-if="
                                    m.preferNot && shared.election.showPreferNot
                                "
                                class="preferNot"
                            >
                                {{ m.name }} has suggested that they not be
                                elected as {{ positionName }}.
                            </div>
                        </td>
                    </tr>
                </table>

                <div v-if="!shared.confirmedVote && shared.isMember">
                    <button
                        class="confirm"
                        :class="{ ready: selectedMember.name }"
                        :disabled="!selectedMember.name"
                        v-on:click="confirm()"
                    >
                        Submit my vote
                        <span v-if="selectedMember"
                            >for {{ selectedMember.name || "___" }} to be
                            {{ positionName }}</span
                        >
                        <span v-else>(pending)</span>
                    </button>
                </div>
            </div>
            <!-- <div v-else>Voting is nt open.</div> -->
            <div
                v-if="
                    shared.confirmedVote ||
                        (!shared.election.votingOpen && selectedMember.name)
                "
                class="confirmation"
            >
                <button
                    class="reveal"
                    v-if="!alwaysShow"
                    v-on:click="clickReveal"
                >
                    <span
                        v-text="reveal ? 'Hide my Vote' : 'Show my Vote here'"
                    ></span>
                </button>
                <label class="alwaysShow" :class="{ revealVote: reveal }">
                    <input
                        v-model="alwaysShow"
                        type="checkbox"
                        v-on:change="clickAlwaysShow"
                    />
                    Always Show
                </label>
                <div
                    v-if="selectedMember.name"
                    class="voteInfo"
                    :class="{ revealVote: reveal }"
                >
                    <p>
                        You voted for {{ selectedMember.name }} to be
                        {{ positionName }}.
                    </p>
                </div>
                <div class="symbolInfo" :class="{ revealVote: reveal }">
                    Your symbol in this voting round:
                    <div
                        class="symbol"
                        :style="{
                            backgroundPosition:
                                '0 -' +
                                shared.symbolOffset(shared.symbol) +
                                'px'
                        }"
                        :title="shared.symbol"
                    ></div>
                </div>
                <p v-if="shared.election.votingOpen">
                    <button v-on:click="changeMyVote">
                        Change my vote
                    </button>
                </p>
            </div>
            <p class="comment">
                All voters remain on this screeen until voting for this position
                is completed.
            </p>
        </div>
    </div>
</template>

<script>
import firebaseDb from "../firebaseInit";
import { debug } from "util";

export default {
    name: "VotingPanel",
    data: function() {
        return {
            selectedMember: {},
            reveal: false,
            alwaysShow: false,
            preferNot: false
        };
    },
    computed: {
        shared: function() {
            return this.$root.shared;
        },
        me: function() {
            return this.shared.me;
        },
        positionName: function() {
            return this.position ? this.position.name : "";
        },
        position: function() {
            var positionId = this.shared.election.positionIdToVoteFor;
            return this.shared.positions.find(p => p.id === positionId);
        },
        electedPositions: function() {
            return this.shared.positions.filter(p => p.electedId);
        }
    },
    watch: {
        // position: function(a, b) {
        //   if (a && (!b || a.id !== b.id)) {
        //     this.startVote();
        //   }
        // },
        "shared.election.votingOpen": function(a) {
            if (a) {
                this.startVote();
            }
        },
        positionName: function() {
            this.shared.confirmedVote = false;
            this.preferNot = false;
        },
        preferNot: function(a) {
            this.shared.dbMe.update({ preferNot: a });
        }
    },
    mounted: function() {
        // var vue = this;
        // if (this.shared.dbElectionRef) {
        //   this.startVoting();
        // }
        // this.preferNot = false;
        if (this.shared.election.votingOpen && !this.shared.me.voted) {
            this.startVote();
        }
        this.preferNot = this.shared.me.preferNot;
    },
    methods: {
        startVote: function() {
            this.shared.dbMe.update({
                voting: true,
                voted: false
            });
            this.shared.confirmedVote = false;
            this.selectedMember = {};
        },
        alreadyIn: function(member) {
            var list = this.electedPositions
                .filter(p => p.electedId === member.id)
                .map(p => p.name);
            if (list.length) {
                return list.join(", ");
            }
            return null;
        },
        clickAlwaysShow: function() {
            if (this.alwaysShow) {
                this.reveal = true;
            } else {
                this.reveal = false;
                this.clickReveal();
            }
        },
        clickReveal: function() {
            var vue = this;
            this.reveal = !this.reveal;
            if (this.reveal && !vue.alwaysShow) {
                setTimeout(function() {
                    if (!vue.alwaysShow) {
                        vue.reveal = false;
                    }
                }, 2000);
            }
        },
        voteFor: function(member) {
            if (this.selectedMember.id === member.id) {
                this.selectedMember = {};
                return;
            }
            this.selectedMember = member;
        },
        confirm: function() {
            var vue = this;
            window.location.hash = "";

            if (!this.selectedMember) {
                console.log("no one selected for vote");
                return;
            }
            if (!this.shared.election.votingOpen) {
                console.log("voting is not open");
                return;
            }
            if (!this.shared.symbol) {
                console.log("no symbol assigned");
                return;
            }

            var path = `/voting/${this.shared.electionKey}/votes/${this.shared.symbol}`;

            // cast my vote
            firebaseDb.ref(path).set(this.selectedMember.id);

            this.shared.dbMe.update({
                voting: false,
                voted: true
            });

            this.reveal = false;
            this.clickReveal();

            this.shared.confirmedVote = true;

            var header = document.getElementById("positionsToFill");
            document.getElementById("electionBody").scrollTop = header
                ? header.clientHeight
                : 0;
            // console.log('scrollTop');
        },
        changeMyVote: function() {
            var path = `/voting/${this.shared.electionKey}/votes/${this.shared.symbol}`;

            // clear my vote
            firebaseDb.ref(path).set("");

            this.shared.dbMe.update({
                voting: true,
                voted: false
            });
            this.shared.confirmedVote = false;
            this.selectedMember = {};
        }
    }
};
</script>

<style lang="less">
.VotingPanel {
    // background-color: #ffeeee;
    // margin: 20px auto;
    // padding: 20px 20px 20px;
    // width: fit-content;
    // border-radius: 3px;

    table {
        margin: 1em auto;
        width: 90%;
    }
    .adminBtns {
        white-space: nowrap;
    }
    tr.memberHolder {
        margin: 10px 0;
        cursor: pointer;

        button {
            margin: 0.25em 0;
            padding: 10px 30px;
            font-size: 1em;
            min-width: 170px;
            height: 4em;
            background-color: #4f5aa2;
            &.selected {
                // want this to be subtle - to avoid shoulder surfing of neighbours
                box-shadow: 0 0 4px 2px #4a993e;
            }

            .alreadyIn {
                display: block;
                font-size: 75%;
                color: #66ec52;
            }
        }

        td {
            font-weight: bold;
            input {
                width: 150px;
            }
        }
    }
    .confirm {
        margin: 1em 0;
        font-size: 1em;
        //&.ready {
        //background-color: blue;
        //color: white;
        //}
    }
    div.preferNot {
        margin: -3px 0 5px 0;
        font-size: 85%;
        font-weight: normal;
        font-style: italic;
        white-space: normal;
        color: #2b2b2b;
    }
    .choosePreferNot {
        margin: -5px 0 20px;
    }
    .confirmation {
        margin: 15px 0 0 0;
        color: grey;
    }
    .voteInfo {
        // margin: 50px 0 20px 0;
        opacity: 0;
        transition: opacity 0.1s;
        &.revealVote {
            opacity: 0.8;
            transition: opacity 1.5s;
        }
    }
    .symbolInfo {
        margin: 5px;
        opacity: 0.1;
        height: 70px;
        .symbol {
            opacity: 0.1;
        }
        &.revealVote {
            opacity: 0.8;
            .symbol {
                opacity: 0.6;
            }
        }
    }
    .comment {
        margin: 3em 0 0;
        font-size: 80%;
        color: #999;
    }
    .alwaysShow {
        display: block;
        margin: 10px;
        opacity: 0.5;
        font-size: 85%;
        &.revealVote {
            opacity: 1;
            transition: opacity 1.5s;
        }
    }
}
</style>
