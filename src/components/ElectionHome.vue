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
            <button
              class="primary"
              v-if="shared.me.isAdmin"
              v-on:click="select(p)"
            >Select for Voting</button>
            <button class v-on:click="view(p)">View</button>
          </td>
        </tr>
      </table>
    </div>

    <!-- <button v-on:click="gotoVotePanel">Cast my Vote</button> -->
    <voting-panel v-if="shared.me.id"/>

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
    };
  },
  computed: {
    shared: function() {
      return _shared;
    }
  },
  watch: {
    
  },
  mounted: function() {
    // var vue = this;
  },
  methods: {
    select: function(position) {
      // change for everyone
      firebaseDb
        .ref(`/elections/${this.shared.electionKey}`)
        .update({ positionIdToVoteFor: "" });
      // do twice, in case we've made a local change
      firebaseDb
        .ref(`/elections/${this.shared.electionKey}`)
        .update({ positionIdToVoteFor: position.id });
    },
    view: function(position) {
      // just for me, temporarily
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
    },
    
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
          background: linear-gradient(to right, rgba(159, 239, 146, 0) 0%, #9fef93 2%, #9fef93 10%, #9fef93 90%, #9fef93 98%, rgba(159, 239, 147, 0) 100%);
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
