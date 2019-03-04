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
          <span v-text="nameOf(p.electedId)"></span>
        </td>
        <td v-if="shared.me.isAdmin">
          <button v-on:click="select(p)">Select</button>
        </td>
      </tr>
    </table>

    <p v-if="shared.me.isAdmin" class="adminBtns">
      <button
        :disabled="!shared.election.positionIdToVoteFor || shared.election.votingOpen"
        v-on:click="openVoting"
      >Open Voting Round</button>
      <button
        :disabled="!shared.election.votingOpen"
        v-on:click="resetVoting"
      >Cancel Voting Round</button>
    </p>

    <!-- <button v-on:click="gotoVotePanel">Cast my Vote</button> -->
    <voting-panel v-if="shared.me.id"/>

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
import VotingPanel from "./VotingPanel.vue";
import firebaseDb from "../firebaseInit";

export default {
  name: "ElectionHome",
  components: {
    ResultPanel,
    VotingPanel
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
      firebaseDb
        .ref(`/elections/${this.shared.electionKey}`)
        .update({ positionIdToVoteFor: position.id });
    },
    gotoVotePanel: function() {
      this.$router.replace("/e/votingPanel");
    },
    nameOf: function(id) {
      if (!id) return "";
      var member = this.shared.members.find(m => m.id === id);
      if (!member) return "";
      return member.name;
    },
    openVoting: function() {
      // create as many slots for vote as we need, skip by a random number to be less predicable
      var voteDict = {};
      var nextLetter = 64;
      var numMembers = this.shared.members.length;
      var randomSpread = 26 / numMembers;

      // do one for each member (doesn't matter which member for each
      this.shared.members.forEach((m, i) => {
        nextLetter += 1 + Math.random() * randomSpread;
        voteDict[String.fromCharCode(nextLetter)] = "";
      });

      firebaseDb.ref(`voting/${this.shared.electionKey}`).set({
        positionId: this.shared.election.positionIdToVoteFor,
        members: this.shared.members.map(m => m.id), // put in this doc for easier access
        votes: voteDict
      });

      firebaseDb.ref(`elections/${this.shared.electionKey}`).update({
        votingOpen: true
      });
    },
    resetVoting: function() {
      firebaseDb.ref(`elections/${this.shared.electionKey}`).update({
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
  .adminBtns {
    button {
      margin: 0 20px;
    }
  }
}
</style>
