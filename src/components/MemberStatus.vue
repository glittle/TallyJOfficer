
<template>
  <div class="MemberStatus">
    <div
      class="member"
      :class="{connected: m.connected, voting: m.voting, voted: m.voted}"
      v-for="m in shared.members"
      :key="m.id"
    >{{ m.name }}</div>
    
    <div class="viewer" v-for="(m,i) in shared.viewers" :key="'v' + i">{{ m.code }}</div>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "MemberStatus",
  data: function() {
    return {};
  },
  computed: {
    shared: function() {
      return _shared;
    }
  },
  mounted: function() {
    // var vue = this;
    // setTimeout(function() {
    //   vue.shared.members[3].voting = true;
    // }, 1500);
    // setTimeout(function() {
    //   vue.shared.members[7].voting = false;
    //   vue.shared.members[7].voted = true;
    // }, 5000);
  }
};
</script>

<style lang="less">
.MemberStatus {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  min-height: 2em;
  padding: 3px 0;
  background: #e4e4fd;
  border-top: 1px solid #3f3fff;

  .viewer,
  .member {
    display: block;
    margin: 3px 10px;
    padding: 1px 3px;
  }

  .viewer {
    background-color: #3f52ff;
    border: 1px solid #3f52ff;
    color: white;
  }

  .member {
    border: 1px solid transparent;
    background-color: #d0d0d0;

    &.connected {
      border-color: #3f3fff;
      background-color: #fff;
    }

    &.voted {
      background-color: #6bff5d;
    }

    &.voting {
      border-color: #fff;
      background-color: rgba(107, 255, 93, 0.4);
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0% {
        background-color: rgba(107, 255, 93, 0.7);
      }
      50% {
        background-color: #fff;
      }
    }
  }
}
</style>
