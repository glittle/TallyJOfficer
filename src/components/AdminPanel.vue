<template>
  <div class="Admin panel">
    <h2>Administration</h2>
    <p>
      To delete this election, click
      <button v-if="!pendingDelete" v-on:click="pendingDelete = true">Delete and Logout</button>
      <button v-if="pendingDelete" v-on:click="deleteNow" class="caution">Are you sure? Click again to Delete Now!</button>
    </p>
  </div>
</template>

<script>
import _shared from "@/shared.js";
import firebaseDb from "../firebaseInit";

export default {
  name: "Admin",
  data: function() {
    return {
      pendingDelete: false,
      pendingTimer: null
    };
  },
  computed: {
    shared: function() {
      return _shared;
    }
  },
  watch: {
    pendingDelete: function(a) {
      if (a) {
        var vue = this;
        clearTimeout(this.pendingTimer);
        this.pendingTimer = setTimeout(() => {
          vue.pendingDelete = false;
        }, 5000);
      }
    }
  },
  methods: {
    deleteNow: function() {
      if (!this.shared.me.isAdmin) {
        return;
      }
      // TODO to upgrade to firebase db
      firebaseDb.ref(`elections/${this.shared.electionKey}`).update({
        deleteMe: true
      });

      //   this.shared.dbElectionRef
      //     .delete()
      //     .then(function() {
      //       vue.deleteStatus = "Done. Good-bye!";
      //       vue.shared.electionKey = "";
      //       vue.shared.me = {};
      //       vue.election = {};

      //       vue.shared.dbUser.updateProfile({
      //         photoURL: "",
      //         displayName: ""
      //       });

      //       vue.dbElectionRef = null;
      //       vue.$router.replace("/");
      //     })
      //     .catch(function(err) {
      //       vue.deleteStatus = "Error: " + err;
      //     });
    }
  }
};
</script>

<style lang="less">
.Admin {
}
</style>
