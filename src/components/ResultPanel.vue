<template>
  <div class="ResultPanel" v-if="position.name">
    <p>Votes for {{position.name}}!</p>
    <table class="results">
      <thead>
        <tr>
          <td class="roundNum">#</td>
          <td v-for="m in shared.members" :key="m.id">{{m.name}}</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(round,i) in oldRounds" :key="i">
          <td class="roundNum">{{i+1}}</td>
          <td :class="['vote' + votesFor(round, name)]" v-for="m in shared.members" :key="m.id">
            <div class="voteCount">{{votesFor(round, m.name)}}</div>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr v-if="position.rounds.length">
          <td class="roundNum">{{position.rounds.length}}</td>
          <td
            :class="['vote' + votesFor(lastRound, name)]"
            v-for="m in shared.members"
            :key="m.id"
          >
            <div class="voteListTitle">{{votesFor(lastRound, m.name)}}</div>
            <div
              class="voteDetail"
              v-for="(v,i) in voteListFor(lastRound, m.name)"
              :key="i"
            >{{v.symbol}}</div>
          </td>
        </tr>
      </tfoot>
    </table>
    <div v-if="position.elected" class="elected">
      <p>Voting is Complete</p>
      <p>{{position.elected.name}} has been elected to serve as the {{position.name}}.</p>
    </div>
    <button class="addTemp" v-on:click="tempMakeResult">Add Fake Results</button>
    <button v-on:click="stopAdding">Stop Adding</button>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "ResultPanel",
  data: function() {
    return {
      // namesWithVotes: [],
      fakeAddTimer: null
    };
  },
  computed: {
    shared: function() {
      return _shared;
    },
    position: function() {
      return this.shared.positions.find(p => p.isActive) || { rounds: [] };
    },
    oldRounds: function() {
      var lastIndex = this.position.rounds.length - 1;
      return this.position.rounds.filter((r, i) => i < lastIndex);
    },
    lastRound: function() {
      var list = this.position.rounds;
      return list.length ? list[list.length - 1] : null;
    }
  },
  watch: {
    position: function() {
      this.showResults();
    }
  },
  mounted: function() {
    this.showResults();
  },
  methods: {
    showResults: function() {
      // var hasVotes = {};
      // this.position.rounds.forEach(r => {
      //   if (r.votes) {
      //     r.votes.forEach(v => (hasVotes[v.name] = true));
      //   }
      // });
      // var hasVotesList = Object.keys(hasVotes);
      // hasVotesList.sort();
      // this.namesWithVotes = hasVotesList;
      // this.namesWithVotes = this.shared.members.map(m => m.name);
    },
    votesFor: function(round, name) {
      if (!round) return null;
      var votes = round.votes.filter(v => v.name === name);
      return votes.length || "-";
    },
    voteListFor: function(round, name) {
      if (!round) return null;
      var list = round.votes.filter(v => v.name === name);
      list.sort((a, b) => (a.symbol < b.symbol ? -1 : 1));
      return list;
    },
    checkIfCompleted: function() {
      var vue = this;
      var votes = this.lastRound.votes;
      var members = this.shared.members;
      var numNeeded = 1 + Math.floor(members.length / 2);
      var membersWithEnoughVotes = members.filter(
        m => votes.filter(v => v.name === m.name).length >= numNeeded
      );
      if (membersWithEnoughVotes.length) {
        // check if multiple? - can't happen
        this.position.elected = membersWithEnoughVotes[0];
      } else {
        vue.fakeAddTimer = setTimeout(() => {
          vue.tempMakeResult();
        }, 1000);
      }
    },
    tempMakeResult: function() {
      var votes = [];
      var members = this.shared.members;
      for (var i = 0; i < members.length; i++) {
        var v = {
          name: members[Math.floor(members.length * Math.random())].name,
          symbol: String.fromCharCode(65 + i)
        };
        votes.push(v);
      }
      var round = { votes: votes };
      this.position.rounds.push(round);
      this.showResults();
      this.checkIfCompleted();
    },
    stopAdding: function() {
      clearTimeout(this.fakeAddTimer);
    }
  }
};
</script>

<style lang="less">
.ResultPanel {
  .addTemp {
    margin: 30px 0;
  }
  .vote1 {
    background-color: #ff990022;
  }
  .vote2 {
    background-color: #ff990066;
  }
  .vote3 {
    background-color: #ff9900aa;
  }
  .vote4 {
    background-color: #ff9900;
  }
  .vote5 {
    background-color: #6bff5d;
  }
  .vote6 {
    background-color: #6bff5d;
  }
  .vote7 {
    background-color: #6bff5d;
  }
  .vote8 {
    background-color: #6bff5d;
  }
  .vote9 {
    background-color: #6bff5d;
  }
  table.results {
    margin: 1em auto 0;
    border-collapse: collapse;
    thead {
      td {
        border-bottom: 1px solid #333;
        padding: 0 10px 0;
      }
    }
    td {
      vertical-align: top;
    }

    tbody {
      td {
        border-top: 1px solid #fff1dd;
      }
    }
    tfoot {
      td {
        border-top: 1px solid #333;
      }
    }

    td.roundNum {
      border-right: 1px solid #333;
      padding: 0 5px 0 5px;
      text-align: right;
    }
  }
  .voteListTitle {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    width: 75%;
    margin: 2px auto 0;
  }
  .elected {
    font-size: 1.5em;
    margin: 0 auto 40px auto;
    padding: 20px 0;
    background-color: #6bff5d;
  }
}
</style>
