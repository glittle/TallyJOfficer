<template>
  <div id="nav">
    <div class="image">
      <img alt="TallyJ logo" src="../assets/logo.png">
    </div>
    <div class="middle" v-if="$route.name !== 'createElection'">
      <span>
        <router-link to="/e/home">Home</router-link>
      </span>
      <span v-if="shared.me.isAdmin">
        <router-link to="/e/setupNames">Names</router-link>
        <span></span>
        <router-link to="/e/setupPositions">Positions</router-link>
      </span>
    </div>
    <div class="myName" :class="{isViewer: shared.isViewer}">
      <span>{{ shared.me.name }}</span>
      <button v-if="shared.me.id" v-on:click="forgetMe">X</button>
      <button v-if="shared.isViewer" v-on:click="forgetViewer">X</button>
    </div>
  </div>
</template>

<script>
import _shared from "@/shared.js";
import firebaseDb from "../firebaseInit";

export default {
  name: "Nav",
  computed: {
    shared: function() {
      return _shared;
    }
  },
  methods: {
    forgetMe: function() {
      if (this.shared.me) {
        // disconnect from the member
        this.shared.dbUser.updateProfile({
          displayName: ""
        });

        firebaseDb
          .ref(`members/${this.shared.electionKey}/${this.shared.me.id}`)
          .update({
            connected: false
          });

        // const dbMembers = this.shared.dbElectionRef.collection("members");
        // dbMembers.doc(this.shared.me.id).update({ connected: false });

        this.shared.me = {};

        this.$router.replace("/e");
      } else {
        // log out of the election
        // var i = this.shared.viewers.findIndex(
        //   v => v.code === this.shared.myName
        // );
        // if (i !== -1) {
        //   this.shared.viewers.splice(i, 1);
        // }
        // this.shared.isViewer = false;
        // this.shared.myName = "";
        // this.$router.replace("/e");
      }
    },
    forgetViewer: function() {
      this.shared.isViewer = false;
    }
  }
};
</script>

<style lang="less">
#nav {
  background: #000;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 2em;

  > div {
    flex-grow: 1;
    min-width: 150px;
  }

  .image {
    text-align: left;
    padding: 4px 0 0 5px;
    img {
      height: 1.5em;
    }
  }

  div.middle {
    flex-grow: 10;
  }

  a {
    font-weight: bold;
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
  }

  .myName {
    text-align: right;
    padding-right: 3px;
    &.isViewer {
      color: rgb(115, 255, 0);
      font-weight: bold;
    }
  }
}
</style>
