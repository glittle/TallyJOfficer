<template>
  <div class="VotingPanel">
    <div v-if="position">
      <p>Voting for {{position.name}}!</p>
      <table v-if="!confirmed">
        <tr class="memberHolder" v-for="(m,i) in shared.members" :key="i" :class="{x: m.x}">
          <td>
            <button
              :class="{selected: selectedMember.name === m.name, selectionMade: selectedMember}"
              v-on:click="voteFor(m)"
            >{{m.name}}</button>
          </td>
          <td>
            <div
              class="preferNot"
              v-if="m.preferNot"
            >Prefers not to be elected as {{position.name}}.</div>
          </td>
        </tr>
      </table>
      <div v-if="!confirmed">
        <button
          class="confirm"
          v-on:click="confirm()"
          :class="{ready:selectedMember}"
          :disabled="!selectedMember"
        >
          Confirm my vote
          <span
            v-if="selectedMember"
          >for {{selectedMember.name}} to be {{position.name}}</span>
        </button>
        <label class="choosePreferNot">
          <input type="checkbox" v-model="preferNot">
          I prefer to not be elected as {{position.name}}.
        </label>
      </div>
      <div v-if="confirmed" class="confirmation">
        <div class="voteInfo" :class="{revealVote: reveal}">
          <p>You voted for {{selectedMember.name}} to be {{position.name}}.</p>
        </div>
        <div class="symbolInfo" :class="{revealVote: reveal}">Your symbol for this vote:
          <div class="symbol">{{symbol}}</div>
        </div>
        <button v-on:click="reveal = !reveal" class="reveal">
          <span v-text="reveal ? 'Hide' : 'Reveal'"></span> my Vote on my screen
        </button>
      </div>

      <result-panel/>
    </div>
    <div v-else>No position is being voted for.</div>
  </div>
</template>

<script>
import _shared from "@/shared.js";
import ResultPanel from "./ResultPanel.vue";

export default {
  name: "VotingPanel",
  components: {
    ResultPanel
  },
  data: function() {
    return {
      selectedMember: "",
      confirmed: false,
      symbol: "",
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
    position: function() {
      var positionId = this.shared.election.positionIdToVoteFor;
      return this.shared.positions.find(p => p.id === positionId);
    },
    dbMe: function() {
      return this.shared.dbElectionRef.collection("members").doc(this.me.id);
    }
  },
  watch: {
    position: function() {
      this.startVoting();
    },
    preferNot: function(a) {
      this.dbMe.update({ preferNot: a });
    }
  },
  mounted: function() {
    // var vue = this;
    this.startVoting();
    this.preferNot = false;
  },
  methods: {
    startVoting: function() {
      this.dbMe.update({
        voting: true,
        voted: false
      });
    },
    voteFor: function(member) {
      this.selectedMember = member;
    },
    confirm: function() {
      var vue = this;
      if (!this.selectedMember) {
        return;
      }
      if (!this.shared.election.votingOpen) {
        return;
      }
      if (!this.shared.symbol) {
        // no symbol assigned
        return;
      }

      var current = this.shared.election.currentVotes;
      if (!current) {
        console.log("currentVoting not available");
        return;
      }

      this.reveal = true;
      this.confirmed = true;

      // this.symbol = String.fromCharCode(65 + 15 * Math.random());

      // // setup vote ledger
      // this.shared.dbElectionRef.doc("currentVoting").update({
      //   votingOpen: true,
      //   currentVoting: {
      //     numVoted: 0, // will be updated be the server
      //     votes: []
      //   }
      // });

      var update = {};
      update[`currentVotes.${this.shared.symbol}`] = this.selectedMember.id;

      this.shared.dbElectionRef.update(update).then(function() {
        console.log("voted");
      });

      this.dbMe.update({
        voting: false,
        voted: true
      });
      // temp
      // var round = {
      //   votes: [{ name: this.selectedMember.name, symbol: this.me.symbol }]
      // };
      // this.position.rounds.push(round);

      setTimeout(function() {
        vue.reveal = false;
      }, 2500);
    }
  }
};
</script>

<style lang="less">
.VotingPanel {
  table {
    margin: 1em auto;
  }
  tr.memberHolder {
    margin: 10px 0;
    cursor: pointer;

    button {
      margin: 0.25em 0;
      min-width: 200px;
      padding: 6px 6px;
      font-weight: bold;
      &.selectionMade {
        color: grey;
      }
      &.selected {
        color: #000;
        background-color: #6bff5d;
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
    margin: 0 0 20px 0;
    padding: 3px 10px;
    &.ready {
      background-color: blue;
      color: white;
    }
  }
  .preferNot {
    color: #333;
    font-size: 90%;
    font-weight: normal;
  }
  .choosePreferNot {
    display: block;
    margin: 10px;
  }
  .confirmation {
    color: grey;
  }
  .voteInfo {
    margin: 50px 0 20px 0;
    opacity: 0;
    transition: opacity 0.1s;
    &.revealVote {
      opacity: 0.8;
      transition: opacity 1.2s;
    }
  }
  .symbolInfo {
    margin: 5px;
    opacity: 0;
    &.revealVote {
      opacity: 0.8;
    }
    .symbol {
      margin: 10px 0 50px;
    }
  }
}
</style>
