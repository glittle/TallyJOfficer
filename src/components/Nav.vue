<template>
  <div id="nav">
    <div class="image">
      <img alt="TallyJ logo" src="../assets/logo.png">
    </div>
    <div class="middle" v-if="$route.name !== 'createElection'">
      <div>
        <router-link to="/">Public</router-link>
        <span></span>
        <router-link to="/e">Election</router-link>
      </div>
      <div v-if="shared.me.isAdmin">
        <router-link to="/e/setupNames">Names</router-link>
        <span></span>
        <router-link to="/e/setupPositions">Positions</router-link>
      </div>
    </div>
    <div class="myName" :class="{isViewer: shared.isViewer}">
      <span>{{ shared.myName }}</span>
      <button v-if="shared.myName" v-on:click="forgetMe">X</button>
    </div>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "Nav",
  computed: {
    shared: function() {
      return _shared;
    }
  },
  methods: {
    forgetMe: function() {
      // testing only??
      var member = this.shared.members.find(m => m.name === this.shared.myName);
      if (member) {
        member.connected = false;
        this.shared.myName = "";
        this.$router.replace("/e");
      } else {
        var i = this.shared.viewers.findIndex(
          v => v.code === this.shared.myName
        );
        if (i !== -1) {
          this.shared.viewers.splice(i, 1);
        }
        this.shared.isViewer = false;
        this.shared.myName = "";
        this.$router.replace("/e");
      }
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
