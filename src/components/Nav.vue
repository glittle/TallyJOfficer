<template>
  <div id="nav">
    <div class="image">
      <router-link to="../">
        <img
          alt="TallyJ logo"
          :title="version"
          src="../assets/logo.png"
        >
      </router-link>
    </div>
    <div
      v-if="$route.name !== 'createElection'"
      class="middle"
    >
      <span v-if="shared.me.isAdmin">
        <router-link to="admin">Setup</router-link>
      </span>
      <span>
        <router-link to="share">Share</router-link>
      </span>
      <span>
        <router-link to="home">Voting</router-link>
      </span>
      <!-- <span v-if="shared.me.isAdmin">
        <router-link to="setupNames">Members</router-link>
      </span>
      <span v-if="shared.me.isAdmin">
        <router-link to="setupPositions">Positions</router-link>
      </span>-->
      <span>
        <router-link to="/guidance">Guidance</router-link>
      </span>
      <span>
        <router-link to="/faq">Help</router-link>
      </span>
    </div>
    <div
      class="myName"
      :class="{isViewer: shared.isViewer}"
      :title="shared.electionKey.substring(1,5)"
    >
      <span>{{ shared.me.name }}</span>
      <button
        v-if="shared.isMember || shared.isViewer"
        v-on:click="forgetMe"
      >
        Change
      </button>
    </div>
  </div>
</template>

<script>
import _shared from "@/shared.js";
import firebaseDb from "../firebaseInit";

export default {
  name: "Nav",
  computed: {
    shared: function () {
      return _shared;
    },
    version: function () {
      return _version;
    }
  },
  methods: {
    forgetMe: function () {
      if (this.shared.me) {
        var id = this.shared.me.id;
        // disconnect from the member/viewer
        this.shared.disconnecting = true;
        this.shared.dbUser.updateProfile({
          displayName: ""
        });

        this.shared.me = {};
        switch (id[0]) {
          case "m":
            firebaseDb.ref(`members/${this.shared.electionKey}/${id}`).update({
              connected: false,
              voted: false,
              voting: false
            });
            break;

          case "v":
            firebaseDb.ref(`viewers/${this.shared.electionKey}/${id}`).remove();
            break;

          default:
            console.log("unexpected", id);
            break;
        }

        this.$router.replace("/e");
      }
    }
  }
};
</script>

<style lang="less">
#nav {
  flex-shrink: 0;
  background: #000;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 2.5em;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);

  > div {
    flex: 1 1 auto;
    white-space: nowrap;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  div.middle {
    flex-grow: 19;
    white-space: normal;
    padding: 2px 0 6px;
    span {
      margin: 0 10px;
    }
  }

  .image {
    text-align: left;
    justify-content: left;
    padding: 4px 0 0 5px;
    img {
      height: 1.5em;
    }
  }

  a {
    color: #fff;
    text-decoration: none;
    &:visited {
      color: #fff;
    }
    &.router-link-exact-active {
      color: #42b983;
    }
  }

  span {
    display: inline-block;
    margin: 3px 0.5em;
    vertical-align: middle;
  }

  button {
    font-size: 0.8em;
  }

  .myName {
    text-align: right;
    padding-right: 3px;
    color: #4a993e;
    &.isViewer {
      font-weight: bold;
    }
  }
}
</style>
