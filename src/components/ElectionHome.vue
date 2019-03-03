<template>
  <div class="ElectionHome">
    <p>Welcome to our Officer Election!</p>
    <p>These positions need to be filled.</p>
    
    <p>
      <a href="../guidance" target="guidance">Read Guidance about these positions</a>
    </p>

    <table class="positionsToFill">
      <tr
        class="positionHolder"
        v-for="p in shared.positions"
        :key="p.name"
        :class="{isActive: p.id === shared.election.positionIdToVoteFor }"
      >
        <td>{{ p.name }}</td>
        <td>
          <span v-text="p.elected ? p.elected.name : ''"></span>
        </td>
        <td>
          <button v-on:click="select(p)">Select</button>
        </td>
      </tr>
    </table>

    <button
      v-if="shared.me.isAdmin"
      :disabled="!shared.election.positionIdToVoteFor || shared.election.votingOpen"
      v-on:click="openVoting"
    >Open Voting Now</button>
    -
    <button
      v-if="shared.me.isAdmin"
      :disabled="!shared.election.votingOpen"
      v-on:click="resetVoting"
    >Cancel and Reset Voting</button>

    <p v-if="shared.me.id && shared.election.votingOpen">
      <button v-on:click="gotoVotePanel">Cast my Vote</button>
    </p>

    <result-panel/>

    <div class="electionLink" v-if="shared.link">
      Shareable link to this election
      <a :href="shared.link">{{shared.link}}</a>
      <p>Be sure to keep a copy of this link - it is your team's secret key to this election!</p>
    </div>
    <!-- <button class="reset" v-on:click="clearStorage">Reset All</button> -->
  </div>
</template>

<script>
import _shared from "@/shared.js";
import ResultPanel from "./ResultPanel.vue";

export default {
  name: "ElectionHome",
  components: {
    ResultPanel
  },
  data: function() {
    return {};
  },
  computed: {
    shared: function() {
      return _shared;
    }
  },
  mounted: function() {
    // var vue = this;
  },
  methods: {
    select: function(position) {
      var vue = this;
      // this.shared.positions.forEach(p => {
      //   var toBeActive = p.id === position.id;
      //   if (p.isActive !== toBeActive) {
      //     vue.shared.update("positions", p.id, { isActive: toBeActive });
      //   }
      // });

      vue.shared.dbElectionRef.update({ positionIdToVoteFor: position.id });

      // this.selectedPosition = position;
    },
    gotoVotePanel: function() {
      this.$router.replace("/e/votingPanel");
    },
    openVoting: function() {
      // create as many slots for vote as we need, skip by a random number to be less predicable
      var voteDict = {};
      var nextLetter = 64;
      this.shared.members.forEach((m, i) => {
        nextLetter += 1 + Math.random() * 2;
        voteDict[String.fromCharCode(nextLetter)] = "";
      });
      // var memberIds = this.shared.members.map(m => {
      //   return { id: m.id, sort: Math.random() };
      // });
      // memberIds.sort((a, b) => (a.sort < b.sort ? -1 : 1));

      this.shared.dbElectionRef.update({
        currentVotes: voteDict,
        members: this.shared.members.map(m => m.id), // put in this doc for easier access
        numVoted: 0,
        votingOpen: true
      });
    },
    resetVoting: function() {
      this.shared.dbElectionRef.update({
        votingOpen: false
      });
    },
    viewGuidance: function() {
      this.$router.push("/e/guidance");
    }
  }
};
</script>

<style lang="less">
.ElectionHome {
  table.positionsToFill {
    margin: 1em auto;
    td {
      width: 200px;
    }
    tr.positionHolder {
      margin: 10px 0;

      &.isActive {
        background: lightgreen;
      }
    }
  }
  .reset {
    margin: 100px 0 10px 0;
  }
  .electionLink {
    margin: 30px 0;
    font-size: 80%;
  }
}
</style>
