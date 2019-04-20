<template>
  <div class="ResultPanel panel" v-if="position.name">
    <h2>Votes for {{position.name}}</h2>
    <table class="results">
      <thead>
        <tr>
          <td class="roundNum">#</td>
          <td v-for="m in shared.members" :key="m.id">{{ m.name }}</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(round,i) in oldRounds" :key="i">
          <td class="roundNum">{{ i+1 }}</td>
          <td :class="['vote' + resultClass(round, m.id)]" v-for="m in shared.members" :key="m.id">
            <div class="voteCount">{{ votesFor(round, m.id) }}</div>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr v-if="positionRounds.length && !shared.election.votingOpen">
          <td class="roundNum">{{ positionRounds.length }}</td>
          <td
            :class="['vote' + resultClass(lastRound, m.id)]"
            v-for="m in shared.members"
            :key="m.id"
          >
            <div class="voteListTitle">{{ votesFor(lastRound, m.id) }}</div>
            <div
              class="voteDetail"
              v-for="(v,i) in voteListFor(lastRound, m.id)"
              :key="i"
            >{{ v.symbol }}</div>
          </td>
        </tr>
        <tr v-if="shared.election.votingOpen">
          <td class="roundNum">{{ positionRounds.length + 1 }}</td>
          <td :colspan="shared.members.length">
            Voting is underway for round {{ positionRounds.length + 1 }}
          </td>
        </tr>
      </tfoot>
    </table>
    <div v-if="personElected" class="elected">
      <p>Voting is Complete</p>
      <p>{{ personElected.name }} has been elected to serve as the {{ position.name }}.</p>
    </div>

    <!-- <button class="addTemp" v-on:click="tempMakeResult">Add Fake Results</button>
    <button v-on:click="stopAdding">Stop Adding</button>-->
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
      return (
        this.shared.positions.find(
          p => p.id === this.shared.election.positionIdToVoteFor
        ) || {}
      );
    },
    positionRounds: function() {
      return this.shared.rounds.filter(
        r => r.id.substr(0, 4) === this.position.id
      );
    },
    oldRounds: function() {
      var lastIndex = this.positionRounds.length - 1;
      if (this.shared.election.votingOpen) {
        lastIndex++;
      }
      return this.positionRounds.filter((r, i) => i < lastIndex);
    },
    lastRound: function() {
      var list = this.positionRounds;
      if (this.shared.election.votingOpen) {
        // when voting is open, don't show previous round's symbols
        return null;
      }
      return list.length ? list[list.length - 1] : null;
    },
    personElected: function() {
      var last = this.lastRound;
      if (!last) return null;
      var id = last.electedId;
      if (!id) return null;
      return this.shared.members.find(m => m.id === id);
    }
  },
  watch: {
    // position: function() {
    //  this.showResults();
    // }
  },
  mounted: function() {
    // this.showResults();
  },
  methods: {
    //   showResults: function() {
    //     // var hasVotes = {};
    //     // this.position.rounds.forEach(r => {
    //     //   if (r.votes) {
    //     //     r.votes.forEach(v => (hasVotes[v.name] = true));
    //     //   }
    //     // });
    //     // var hasVotesList = Object.keys(hasVotes);
    //     // hasVotesList.sort();
    //     // this.namesWithVotes = hasVotesList;
    //     // this.namesWithVotes = this.shared.members.map(m => m.name);
    //   },

    resultClass: function(round, id) {
      if (!round) return null;
      if (round.electedId) {
        return "Done";
      }
      var votes = round.votes.filter(v => v.voteId === id).length;
      if (votes === 0) {
        return "0";
      }
      var scale = (10 * votes) / this.shared.numVotesRequired;
      if (scale >= 10) {
        return "Done";
      }
      return 1 + Math.floor(scale / 3); // 1,2,3,4
    },
    votesFor: function(round, id) {
      if (!round) return null;
      var votes = round.votes.filter(v => v.voteId === id);
      return votes.length || "-";
    },
    voteListFor: function(round, id) {
      if (!round) return null;
      var list = round.votes.filter(v => v.voteId === id);
      list.sort((a, b) => (a.symbol < b.symbol ? -1 : 1));
      return list;
    },
    // checkIfCompleted: function(round) {
    //   var votes = round.votes;
    //   var members = this.shared.members;
    //   var membersWithEnoughVotes = members.filter(
    //     m =>
    //       votes.filter(v => v.voteId === m.id).length >=
    //       this.shared.numVotesRequired
    //   );
    //   if (membersWithEnoughVotes.length) {
    //     // check if multiple? - can't happen
    //     this.position.elected = membersWithEnoughVotes[0];

    //     round.completed = true;
    //   } else {
    //     this.position.elected = null;
    //     round.completed = false;
    //   }
    // },
    // tempMakeResult: function() {
    //   var votes = [];
    //   var members = this.shared.members;
    //   for (var i = 0; i < members.length; i++) {
    //     var v = {
    //       id: members[Math.floor(members.length * Math.random())].id,
    //       symbol: String.fromCharCode(65 + i)
    //     };
    //     votes.push(v);
    //   }
    //   var round = {
    //     id:
    //       this.position.id +
    //       "_" +
    //       ("00" + this.positionRounds.length).slice(-3),
    //     votes: votes
    //   };
    //   this.checkIfCompleted(round);

    //   this.shared.dbElectionRef
    //     .collection("rounds")
    //     .doc(round.id)
    //     .set(round);

    //   var vue = this;
    //   if (!round.completed) {
    //     vue.fakeAddTimer = setTimeout(() => {
    //       vue.tempMakeResult();
    //     }, 1000);
    //   }
    //   // this.showResults();
    // },
    stopAdding: function() {
      clearTimeout(this.fakeAddTimer);
    }
  }
};
</script>

<style lang="less">
.ResultPanel {
  overflow: auto;
  .addTemp {
    margin: 30px 0;
  }
  .vote1 {
    background-color: rgba(255, 153, 0, 0.14);
  }
  .vote2 {
    background-color: rgba(255, 153, 0, 0.4);
  }
  .vote3 {
    background-color: rgba(255, 153, 0, 0.66);
  }
  .vote4 {
    background-color: #ff9900;
  }
  .voteDone {
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
      padding: 1px 5px 0 5px;
      text-align: right;
      font-size: 60%;
    }
  }
  .voteListTitle {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    width: 75%;
    margin: 2px auto 0;
  }
  .elected {
    font-size: 1.4em;
    margin: 10px auto 20px auto;
    padding: 1px 40px;
    border-radius: 15px;
    background-color: #6bff5d;
  }
}
</style>
