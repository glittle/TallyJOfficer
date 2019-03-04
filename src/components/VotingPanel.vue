<template>
  <div class="VotingPanel">
    <div v-if="position && shared.election.votingOpen">
      <p>Voting for {{position.name}}!</p>
      <p>
        <label class="choosePreferNot">
          <input type="checkbox" v-model="preferNot">
          I prefer to not be elected as {{position.name}}.
        </label>
      </p>

      <table v-if="!confirmed">
        <tr class="memberHolder" v-for="(m,i) in shared.members" :key="i" :class="{x: m.x}">
          <td>
            <button
              :class="{selected: selectedMember.name === m.name, selectionMade: selectedMember}"
              v-on:click="voteFor(m)"
            >
              {{m.name}}
              <div
                class="preferNot"
                v-if="m.preferNot"
              >(Prefers not be elected as {{position.name}})</div>
            </button>
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
          Submit my vote
          <span
            v-if="selectedMember"
          >for {{selectedMember.name}} to be {{position.name}}</span>
          <span v-else>(pending)</span>
        </button>
      </div>
    </div>
    <div v-else>Voting is not open.</div>
    <div v-if="confirmed" class="confirmation">
      <div class="voteInfo" :class="{revealVote: reveal}">
        <p>You voted for {{selectedMember.name}} to be {{position.name}}.</p>
      </div>
      <div class="symbolInfo" :class="{revealVote: reveal}">Your symbol for this vote:
        <div class="symbol">{{shared.symbol}}</div>
      </div>
      <button v-on:click="reveal = !reveal" class="reveal">
        <span v-text="reveal ? 'Hide' : 'Reveal'"></span> my Vote on my screen
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
      selectedMember: "",
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
    position: function() {
      var positionId = this.shared.election.positionIdToVoteFor;
      return this.shared.positions.find(p => p.id === positionId);
    },
    dbMe: function() {
      return firebaseDb.ref(`members/${this.shared.electionKey}/${this.me.id}`);
    }
  },
  watch: {
    // position: function() {
    // this.startVoting();
    // },
    preferNot: function(a) {
      this.dbMe.update({ preferNot: a });
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
    // startVoting: function() {
    //   this.dbMe.update({
    //     voting: true,
    //     voted: false
    //   });
    // },
    voteFor: function(member) {
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

      this.dbMe.update({
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
      this.dbMe.update({
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
  background-color: #ffeeee;
  margin: 20px auto;
  padding: 20px 20px 20px;
  width: fit-content;
  border-radius: 3px;

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
      // &.selectionMade {
      //   color: grey;
      // }
      &.selected {
        color: #000;
        background-color: #afffa8;
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
    padding: 10px 20px;
    &.ready {
      //background-color: blue;
      //color: white;
    }
  }
  .preferNot {
    color: #333;
    font-size: 90%;
    font-weight: normal;
    margin: 5px 0 0 0;
    white-space: normal;
  }
  .choosePreferNot {
    display: block;
    margin: 10px;
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
