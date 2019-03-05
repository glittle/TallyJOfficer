<template>
  <div class="CreateElection">
    <div v-if="shared.electionLoadAttempted && !shared.election.id">
      <div class="panel">
        <h1>TallyJ for Officers</h1>
        <p>Welcome to your new officer election!</p>
        <p>You are creating a new election that will assist your team as you elect its officers.</p>
        <p>
          <strong>Please note</strong>: if you are trying to join an existing election, you must use the link given to you by the person who created it.
        </p>
      </div>
      <div class="panel">
        <h1>Create an Election</h1>
        <p>
          To get started, we need your first name.
          Please enter the name that you want other
          members to use when talking with you, usually just your first name. (You can change it later, if you want.)
        </p>
        <p>You will be the "administrator" of this election and able to manage it in this system.</p>
        <p>When the election is created, you will be given a unique URL that you will need to share with the rest of the members.</p>
        <div class="nameInput">
          Your name
          <input v-model="name" v-on:keyup.enter="create">
        </div>
        <div>
          <button :disabled="!name" v-on:click="create">Create the Election</button>
        </div>
        <p class="leave">
          <button v-on:click="leave">Cancel</button>
        </p>
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
  beforeUpdate: function() {
    if (this.shared.election.created) {
      this.$router.replace("/e");
    }
  },
  mounted: function() {
    var vue = this;

    if (this.shared.election.created) {
      this.$router.replace("/e");
      return;
    }

    this.shared.$on("election-created", function() {
      if (vue.shared.members.filter(m => m.name).length < 2) {
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
    },
    leave: function() {
      this.$router.replace("/");
    }
  }
};
</script>

<style lang="less">
.CreateElection {
  text-align: left;
  padding: 0 0 0 15px;
  max-width: 700px;
  margin: 0 auto;

  .nameInput {
    margin: 0 0 1em;
    input {
      width: 100px;
    }
  }
  .loading {
    margin: 100px auto;
    font-size: 1.3em;
  }
  .leave {
    margin-top: 50px;
  }
}
</style>
