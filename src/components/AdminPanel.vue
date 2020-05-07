<template>
  <div>
    <setup-names></setup-names>
    <setup-positions></setup-positions>
    <div class="panel">
      <h1>3. Election is ready</h1>
      <p>When the team members and the positions are set up, you are ready to
        <router-link to="share">Share</router-link> your election and then open
        <router-link to="home">Voting</router-link>.</p>
    </div>

    <div class="Admin panel">
      <h2>All Done?</h2>
      <p>You are welcome to leave this election on the server to review later.</p>
      <p>However, if you want to delete this election, click:</p>
      <button
        v-if="!pendingDelete"
        class="caution"
        v-on:click="pendingDelete = true"
      >
        Delete...
      </button>
      <button
        v-if="pendingDelete"
        class="caution"
        v-on:click="deleteNow"
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
  data: function () {
    return {
      pendingDelete: false,
      pendingTimer: null
    };
  },
  computed: {
    shared: function () {
      return _shared;
    }
  },
  watch: {
    pendingDelete: function (a) {
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
    deleteNow: function () {
      if (!this.shared.me.isAdmin) {
        return;
      }
      // TODO to upgrade to firebase db
      firebaseDb.ref(`/elections/${this.shared.electionKey}`).update({
        deleteMe: true
      });
    }
  }
};
</script>

<style lang="less">
//.Admin {
//}
</style>
