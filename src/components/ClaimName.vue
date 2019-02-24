<template>
  <div class="ClaimName">
    <p>Welcome to our officer election!</p>
    <p>Please claim your name...</p>
    <table>
      <tr
        class="memberHolder"
        v-for="m in shared.members"
        :key="m.name"
        :class="{claimed: m.connected}"
      >
        <td>{{ m.name }}</td>
        <td>
          <button v-on:click="claim(m)" v-if="!m.connected" :disabled="claimMade">This is me!</button>
          <span v-else>Claimed</span>
        </td>
      </tr>
    </table>
    <hr>
    <p>Or, if this computer will be used to display results, click <button v-on:click="claimViewer">Viewer</button></p>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "ClaimName",
  data: function() {
    return {
      claimMade: false
    };
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
    claim: function(member) {
      if (member.connected) {
        // already claimed!
        return;
      }
      member.isMe = true;
      member.connected = true; // temp
      this.claimMade = true;
      this.shared.myName = member.name;
      this.$router.replace("/e/home");
    },
    claimViewer: function() {
      this.shared.startMeAsViewer();
      this.$router.replace("/e/home");
    }
  }
};
</script>

<style lang="less">
.ClaimName {
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
