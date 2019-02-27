<template>
  <div class="ElectionHome">
    <p>Welcome to our Officer Election!</p>
    <p>These positions need to be filled.</p>
    <table class="positionsToFill">
      <tr
        class="positionHolder"
        v-for="p in shared.positions"
        :key="p.name"
        :class="{isActive: p.id === shared.election.activePositionId }"
      >
        <td>{{ p.name }}</td>
        <td>
          <span v-text="p.elected ? p.elected.name : ''"></span>
        </td>
        <td>
          <button v-on:click="select(p)">Select</button>
          <button v-on:click="viewGuidance">View Guidance</button>
        </td>
      </tr>
    </table>
    <button :disabled="!shared.election.activePositionId" v-on:click="voteNow">Vote Now</button>

    <result-panel/>

    <div class="electionLink" v-if="shared.link">
      Shareable link to this election
      <a :href="shared.link">{{shared.link}}</a>
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
    },
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

      vue.shared.dbElectionRef.update({ activePositionId: position.id });

      // this.selectedPosition = position;
    },
    voteNow: function() {
      if (!this.shared.isViewer) {
        this.$router.replace("/e/votingPanel");
      }
    },
    // clearStorage: function() {
    //  this.shared.clearStorage();
    //  this.$router.replace("/e");
    // },
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
  .electionLink{
    margin: 30px 0;
    font-size: 80%;
  }
}
</style>
