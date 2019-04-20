<template>
  <div>
    <setup-names></setup-names>
    <setup-positions></setup-positions>
    <div class="Admin panel">
      <h2>All Done? Delete the election</h2>
      <p>To delete this election, click:</p>
      <button class="caution" v-if="!pendingDelete" v-on:click="pendingDelete = true">Delete...</button>
      <button
        v-if="pendingDelete"
        v-on:click="deleteNow"
        class="caution"
      >Are you sure? Click again to Delete now! No Undo.</button>
    </div>
  </div>
</template>

<script>
import _shared from "@/shared.js";
import firebaseDb from "../firebaseInit";
import SetupNames from "./SetupNames.vue";
import SetupPositions from "./SetupPositions.vue";

export default {
  name: "Admin",
  components: {
    SetupNames,
    SetupPositions
  },
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
