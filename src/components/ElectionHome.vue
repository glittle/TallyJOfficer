<template>
  <div class="ElectionHome">
    <div class="positionsToFill panel">
      <h1>Positions to Elect</h1>
      <table>
        <tr
          class="positionHolder"
          v-for="p in shared.positions"
          :key="p.name"
          :class="{ isActive: p.id === shared.election.positionIdToVoteFor }"
        >
          <td>{{ p.name }}</td>
          <td>
            <span v-text="nameOf(p.electedId)"></span>
          </td>
          <td class="positionBtns">
            <!-- <button
              class="primary"
              v-if="shared.me.isAdmin"
              v-on:click="select(p)"
            >Select for Voting</button>-->
            <button v-if="!shared.election.votingOpen" v-on:click="view(p)">View</button>
          </td>
        </tr>
      </table>
      <p v-if="shared.me.isAdmin" class="adminBtns">
        <button
          v-if="viewedPosition && !shared.election.votingOpen"
          v-on:click="openVoting"
          class="primary"
        >Admin: Open Voting for {{viewedPosition.name}}</button>
        <button
          v-if="shared.election.votingOpen"
          class="caution"
          v-on:click="resetVoting"
        >Admin: Cancel Voting</button>
      </p>
    </div>

    <!-- <button v-on:click="gotoVotePanel">Cast my Vote</button> -->
    <voting-panel v-if="shared.isViewer || shared.isMember"/>

    <result-panel/>
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
    return {
      viewedPosition: null
    };
  },
  computed: {
    shared: function() {
      return _shared;
    }
  },
  watch: {},
  mounted: function() {
     var vue = this;
     vue.viewedPosition = vue.shared.positions.find(p => p.id === vue.shared.election.positionIdToVoteFor);
  },
  methods: {
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
      firebaseDb.ref(`voting/${this.shared.electionKey}`).set({
        positionId: positionIdToOpen,
        votes: voteDict
      });

      // turn on voting
      firebaseDb.ref(`elections/${this.shared.electionKey}`).update({
        votingOpen: true
      });
    },
    resetVoting: function() {
      // turn off voting
      firebaseDb.ref(`elections/${this.shared.electionKey}`).update({
        votingOpen: false
      });
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
.ElectionHome {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 10px;
  .positionsToFill {
    table {
      margin: 1em auto 0;
      border-collapse: collapse;
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
          background: linear-gradient(
            to right,
            rgba(159, 239, 146, 0) 0%,
            #9fef93 2%,
            #9fef93 10%,
            #9fef93 90%,
            #9fef93 98%,
            rgba(159, 239, 147, 0) 100%
          );
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
}
</style>
