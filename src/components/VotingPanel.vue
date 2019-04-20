<template>
  <div class="VotingPanel panel" v-if="position && (shared.election.votingOpen || confirmed)">
    <div>
      <h2>Voting for {{positionName}}</h2>
      <div class="choosePreferNot" v-if="shared.isMember">
        <label>
          <input type="checkbox" v-model="preferNot">
          I prefer to not be elected as {{positionName}}.
        </label>
      </div>

      <table v-if="!confirmed && shared.isMember">
        <tr
          class="memberHolder"
          v-for="(m, i) in shared.members"
          :key="m.id"
          :class="{preferNot: m.preferNot}"
        >
          <td>
            <button
              :class="{selected: selectedMember.name === m.name, selectionMade: selectedMember}"
              v-on:click="voteFor(m)"
            >{{m.name}}</button>
            <div
              class="preferNot"
              v-if="m.preferNot"
            >({{m.name}} prefers not be elected as {{positionName}})</div>
          </td>
        </tr>
      </table>
      <div v-if="!confirmed && shared.isMember">
        <button
          class="confirm primary"
          v-on:click="confirm()"
          :class="{ready:selectedMember.name}"
          :disabled="!selectedMember.name"
        >
          Submit my vote
          <span
            v-if="selectedMember"
          >for {{selectedMember.name || '___'}} to be {{positionName}}</span>
          <span v-else>(pending)</span>
        </button>
      </div>
    </div>
    <!-- <div v-else>Voting is nt open.</div> -->
    <div
      v-if="confirmed || !shared.election.votingOpen && selectedMember.name"
      class="confirmation"
    >
      <div class="voteInfo" :class="{revealVote: reveal}">
        <p>You voted for {{selectedMember.name}} to be {{positionName}}.</p>
      </div>
      <div class="symbolInfo" :class="{revealVote: reveal}">
        Your symbol for this vote:
        <div class="symbol">{{shared.symbol}}</div>
      </div>
      <button v-on:click="reveal = !reveal" class="reveal">
        <span v-text="reveal ? 'Hide my Vote' : 'Reveal my Vote on my screen'"></span>
      </button>
      <p v-if="shared.election.votingOpen">
        <button v-on:click="changeMyVote">Change my vote</button>
      </p>
    </div>
  </div>
</template>

<script>
import _shared from "@/shared.js";
import firebaseDb from "../firebaseInit";

export default {
  name: "VotingPanel",
  data: function() {
    return {
      selectedMember: {},
      positionName: '',
      confirmed: false,
      reveal: false,
      preferNot: false
    };
  },
  computed: {
    shared: function() {
      return _shared;
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
  },
  methods: {
    startVote: function() {
      this.shared.dbMe.update({
        voting: true,
        voted: false
      });
      this.confirmed = false;
      this.selectedMember = {};
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

      var path = `voting/${this.shared.electionKey}/votes/${
        this.shared.symbol
      }`;

      // cast my vote
      firebaseDb.ref(path).set(this.selectedMember.id);

      this.shared.dbMe.update({
        voting: false,
        voted: true
      });

      this.reveal = true;
      this.confirmed = true;

      setTimeout(function() {
        vue.reveal = false;
      }, 2500);
    },
    changeMyVote: function() {
      this.shared.dbMe.update({
        voting: true,
        voted: false
      });
      this.confirmed = false;
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
      height: auto;
      &.selected {
        // want this to be subtle - to avoid shoulder surfing of neighbours
        box-shadow: 0 0 3px 1px #000;
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
    margin: 0 0 1em;
    font-size: 1em;
    &.ready {
      //background-color: blue;
      //color: white;
    }
  }
  div.preferNot {
    margin: -5px 0 5px 0;
    font-size: 85%;
    font-weight: normal;
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
    margin: 50px 0 20px 0;
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
    &.revealVote {
      opacity: 0.8;
    }
    .symbol {
      margin: 10px 0 50px;
    }
  }
}
</style>
