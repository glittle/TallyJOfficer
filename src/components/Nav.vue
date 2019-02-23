<template>
  <div id="nav">
    <div v-if="shared.isAdmin">
      <router-link to="/">Public</router-link>|
      <router-link to="/e">Election</router-link>|
      <router-link to="/e/setupNames">Names</router-link>|
      <router-link to="/e/setupPositions">Positions</router-link>
    </div>
    <div v-else>
      <router-link to="/">Public</router-link>|
      <router-link to="/e">Election</router-link>
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
  }
};
</script>

<style lang="less">
#nav {
  background: #000;
  color: #fff;
  a {
    font-weight: bold;
    &.router-link-exact-active {
      color: #42b983;
    }
    &:visited {
      color: #fff;
    }
  }
}
</style>
