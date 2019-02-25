<template>
  <div class="CreateElection">
    <div v-if="shared.electionLoadAttempted && !shared.electionId">
      <h1>Officer Election</h1>
      <p>Welcome to your new officer election.</p>
      <p>You are creating the election that will be used by your team to elect its officers.</p>
      <p>When it is created, you will be given a unique URL that you can share with the rest of the members.</p>
      <h2>Create Election</h2>
      <p>To get started, we need your name.</p>
      <p>
        Please enter the name that you want other
        members to use when talking with you, usually just your first name. (You can change it later, if you want.)
      </p>
      <p>You will be the "administrator" of this election and able to manage it in this system.</p>
      <div class="nameInput">
        Your name
        <input v-model="name" v-on:keyup.enter="create">
      </div>
      <div>
        <button :disabled="!name" v-on:click="create">Create the Election</button>
      </div>
    </div>
    <div v-else class="loading">Loading...</div>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "CreateElection",
  components: {},
  data: function() {
    return {
      name: ""
    };
  },
  computed: {
    shared: function() {
      return _shared;
    }
  },
  mounted: function() {
    // var vue = this;
    var vue = this;

    this.shared.$on("election-created", function() {
      vue.shared.isAdmin = true;
      if (vue.shared.members.length < 2) {
        vue.$router.replace("/e/setupNames");
        return;
      }
      vue.$router.replace("/e");
    });
    this.shared.$on("election-loaded", function() {
      vue.$router.replace("/e");
    });
  },
  methods: {
    create: function() {
      this.shared.createElection(this.name);
    }
  }
};
</script>

<style lang="less">
.CreateElection {
  text-align: left;
  padding: 0 0 0 15px;

  .nameInput {
    margin: 0 0 1em;
    input {
      width: 100px;
    }
  }
  .loading {
    margin: 100px 0 0 100px;
    font-size: 1.3em;
  }
}
</style>
