<template>
  <div class="SetupPositions">
    <p>Welcome to your Officer Election!</p>
    <p>Configure the positions to be filled.</p>
    <table>
      <tr class="positionHolder" v-for="(m,i) in shared.positions" :key="i" :class="{claimed: m.x}">
        <td>
          <input type="text" max-length="20" v-model="m.name">
        </td>
        <td>
          <button v-on:click="remove(i)">Remove</button>
        </td>
      </tr>
      <tfoot>
        <tr>
          <td><button v-on:click="add">Add Another</button></td>
          <td></td>
        </tr>
      </tfoot>
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
    claim: function(member) {},
    remove: function(i) {
      this.shared.positions.splice(i, 1);
    },
    add: function(i) {
      this.shared.positions.push(this.shared.makePosition(""));
    }
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
      input {
        width: 150px;
      }
    }

    &.claimed {
      td {
        font-weight: normal;
      }
    }
  }
}
</style>
