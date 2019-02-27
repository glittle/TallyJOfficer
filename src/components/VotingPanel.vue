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
          <input type="checkbox" v-model="me.preferNot">
          I prefer to not be elected as {{position.name}}.
        </label>
      </div>
      <div v-if="confirmed" class="confirmation">
        <div class="voteInfo" :class="{revealVote: reveal}">
          <p>You voted for {{selectedMember.name}} to be {{position.name}}.</p>
        </div>
        <div class="symbolInfo" :class="{revealVote: reveal}">Your symbol for this vote:
          <div class="symbol">{{me.symbol}}</div>
        </div>
        <button v-on:click="reveal = !reveal" class="reveal">
          <span v-text="reveal ? 'Hide' : 'Reveal'"></span> my Vote on my screen
        </button>
      </div>
    </div>
    <div v-else>No position is being voted for.</div>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "VotingPanel",
  components: {},
  data: function() {
    return {
      selectedMember: "",
      confirmed: false,
      reveal: false
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
      var positionId = this.shared.election.activePositionId;
      return this.shared.positions.find(p => p.id === positionId);
    }
  },
  watch: {
    position: function() {
      this.startVoting();
    }
  },
  mounted: function() {
    // var vue = this;
    this.startVoting();
  },
  methods: {
    startVoting: function() {
      var me = this.me;
      me.voting = true;
      me.voted = false;
      me.preferNot = false;
    },
    voteFor: function(member) {
      this.selectedMember = member;
    },
    confirm: function() {
      if (!this.selectedMember) {
        return;
      }
      var vue = this;
      var me = this.me;
      this.reveal = true;
      this.confirmed = true;
      me.voted = true;
      me.voting = false;
      me.symbol = String.fromCharCode(65 + 15 * Math.random());

      // temp
      var round = {
        votes: [{ name: this.selectedMember.name, symbol: this.me.symbol }]
      };
      this.position.rounds.push(round);

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
