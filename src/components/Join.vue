<template>
  <div class="Join">
    This is the join screen
  </div>
</template>

<script>
import _shared from "@/shared.js";
import firebaseDb from "../firebaseInit";
import Vue from "vue";


export default {
  name: "Join",
  data: function() {
    return {
    };
  },
  computed: {
    shared: function() {
      return _shared;
    },
    version: function() {
      return _version;
    }
  },
  watch: {},
  mounted: function() {
    console.log('mount Join')
  },
  beforeDestroy: function() {
  },
  methods: {
  }
};
</script>

<style lang="less">
.Join {
  //
}
</style>
