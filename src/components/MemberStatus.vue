
<template>
  <div class="MemberStatus">
    <div
      class="member"
      :class="{connected: m.connected, voting: m.voting, voted: m.voted}"
      v-for="m in shared.members"
      :key="m.name"
    >{{m.name}}</div>
  </div>
</template>

<script>
// import _shared from '@/components/shared.js';

export default {
  name: "MemberStatus",
  props: {
    shared: Object
  },
  data: function() {
    return {};
  },
  computed: {}
};
</script>

<style lang="less">
.MemberStatus {
  flex-grow: 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  background: #e4e4fd;
  border-top: 1px solid #3f3fff;

  .member {
    border: 1px solid transparent;
    padding: 1px 3px;
    display: block;
    margin: 3px 10px;
    background-color: #d0d0d0;
    cursor: help;

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
