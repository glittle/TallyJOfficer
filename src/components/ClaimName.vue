<template>
  <div class="ClaimName">
    <p>Welcome to our officer election!</p>
    <p>Please claim your name...</p>
    <table>
      <tr
        class="memberHolder"
        v-for="m in shared.members"
        :key="m.id"
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
    <p>
      Or, if this computer will be used to display results, click
      <button
        v-on:click="claimViewer"
      >Viewer</button>
    </p>
    <hr>
    <p v-if="!shared.me.id">
      To leave this election entirely, click
      <button v-on:click="logout">Logout</button>
    </p>
    <hr>
    <p v-if="!shared.me.id">
      To delete this election entirely, click
      <button v-on:click="deleteElection">Delete and Logout</button>
      <span class="deleteStatus">{{deleteStatus}}</span>
    </p>
    <hr>
    <p class="electionLink" v-if="shared.link">
      Shareable link to this election
      <a :href="shared.link">{{shared.link}}</a>
    </p>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "ClaimName",
  data: function() {
    return {
      claimMade: false,
      deleteStatus: null
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

      this.shared.me = member;

      const dbMembers = this.shared.dbElectionRef.collection("members");
      dbMembers.doc(member.id).update({ connected: true });

      // member.connected = true; // temp
      // this.claimMade = true;
      // this.shared.myName = member.name;
      this.$router.replace("/e/home");
    },
    logout: function() {
      var vue = this;
      vue.shared.electionId = "";
      vue.shared.me = {};
      vue.election = {};
      this.shared.dbUser.updateProfile({
        photoURL: "",
        displayName: ""
      });
      this.shared.dbElectionRef = null;
      this.$router.replace("/");
    },
    deleteElection: function() {
      this.deleteStatus = "Deleting...";
      var vue = this;
      this.shared.dbElectionRef
        .delete()
        .then(function() {
          vue.deleteStatus = "Done. Good-bye!";
          vue.shared.electionId = "";
          vue.shared.me = {};
          vue.election = {};

          vue.dbUser.updateProfile({
            photoURL: "",
            displayName: ""
          });

          vue.dbElectionRef = null;
          vue.$router.replace("/");
        })
        .catch(function(err) {
          vue.deleteStatus = "Error: " + err;
        });
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
      margin: 0.6em 10px;
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
  .deleteStatus {
    display: block;
    margin: 5px 0 20px 0;
  }
  .electionLink {
    margin: 30px 0;
    font-size: 80%;
  }
}
</style>
