<template>
  <div class="ElectionHome">
    <p>Welcome to our Officer Election!</p>
    <p>These positions need to be filled.</p>
    <table>
      <tr
        class="positionHolder"
        v-for="p in shared.positions"
        :key="p.name"
        :class="{isActive: p.isActive}"
      >
        <td>{{ p.name }}</td>
        <td>-</td>
        <td>
          <button v-on:click="voteFor(p)">Vote Now</button>
        </td>
      </tr>
    </table>
    
    <button class="reset" v-on:click="clearStorage">Reset All</button>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "ElectionHome",
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
    claim: function(member) {},
    voteFor: function(position) {
      this.shared.positions.forEach(p => (p.isActive = false));
      position.isActive = true;

      this.$router.replace("/e/votingPanel");
    },
    clearStorage: function() {
      this.shared.clearStorage();
      this.$router.replace("/e");
    }
  }
};
</script>

<style lang="less">
.ElectionHome {
  table {
    margin: 1em auto;
  }
  td {
    width: 200px;
  }
  tr.positionHolder {
    margin: 10px 0;

    &.isActive {
      background: lightgreen;
    }
  }
  .reset {
    margin: 100px 0 10px 0;
  }
}
</style>
