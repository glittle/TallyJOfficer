<template>
  <div class="ClaimName">
    <div class="panel">
      <p>Please claim your name...</p>
      <table>
        <tr
          class="memberHolder"
          v-for="m in shared.members"
          :key="m.id"
          :class="{claimed: m.connected}"
        >
          <th>{{ m.name }}</th>
          <td>
            <button
              v-if="m.participating && !m.connected"
              v-on:click="claim(m)"
              :disabled="claimMade"
            >This is me!</button>
            <span v-if="m.connected">Claimed</span>
            <span v-if="!m.participating">Not Voting</span>
          </td>
        </tr>
      </table>
    </div>
    <div class="panel">
      <p>
        Or, if this computer will be used to display results, click
        <button
          v-on:click="claimViewer"
        >Viewer</button>
      </p>
      <p>This should be used for any computer used to project results for all to see.</p>
    </div>
    <div class="panel" v-if="!shared.me.id">
      <p>
        To leave this election entirely, click
        <button v-on:click="logout">Logout</button>
      </p>
      
    </div>
    
  </div>
</template>

<script>
import _shared from "@/shared.js";
// import firebaseDb from "../firebaseInit";

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
  updated: function() {
    if (this.shared.me.id) {
      // can't look here if already claimed?
      this.$router.replace("/e");
    }
  },
  methods: {
    claim: function(member) {
      if (member.connected) {
        // already claimed!
        return;
      }

      this.shared.dbUser.updateProfile({
        displayName: member.id
      });

      this.shared.claimMember(member.id);

      this.$router.replace("/e/home");
    },
    logout: function() {
     this.shared.logout();
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
  max-width: 700px;
  margin: 0 auto;
  padding: 0 10px;

  table {
    margin: 1em auto;
    th {
      font-weight: normal;
      padding-right: 40px;
    }
  }
  tr.memberHolder {
    height: 50px;
    cursor: pointer;
  }
}
</style>
