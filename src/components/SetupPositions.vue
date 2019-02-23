<template>
  <div class="SetupPositions">
    <p>Welcome to your Officer Election!</p>
    <p>Configure the positions to be filled.</p>
    <table>
      <tr
        class="positionHolder"
        v-for="m in shared.positions"
        :key="m.name"
        :class="{claimed: m.x}"
      >
        <td>
          <input type="text" :value="m.name">
        </td>
        <td></td>
      </tr>
    </table>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "SetupPositions",
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
    claim: function(member) {}
  }
};
</script>

<style lang="less">
.SetupPositions {
  table {
    margin: 1em auto;
  }
  tr.memberHolder {
    margin: 10px 0;
    cursor: pointer;

    button {
      margin: 1em 0;
    }

    td {
      font-weight: bold;
    }

    &.claimed {
      td {
        font-weight: normal;
      }
    }
  }
}
</style>
