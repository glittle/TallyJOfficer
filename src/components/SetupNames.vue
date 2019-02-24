<template>
  <div class="SetupNames">
    <p>Welcome to your Officer Election!</p>
    <p>Add the names of the members here.</p>
    <table>
      <tr
        class="memberHolder"
        v-for="(m,i) in shared.members"
        :key="i"
        :class="{claimed: m.connected}"
      >
        <td>
          <input type="text" v-model="m.name">
        </td>
        <td></td>
      </tr>
    </table>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "SetupNames",
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
.SetupNames {
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
