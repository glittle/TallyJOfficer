<template>
  <div id="nav">
    <router-link to="/">Public</router-link>|
    <router-link to="/e">Election</router-link>
  </div>
</template>

<script>
export default {
  name: "Nav"
};
</script>

<style lang="less">
#nav {
  background: #000;
  color: #fff;
  flex-grow: 0;
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
