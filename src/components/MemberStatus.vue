
<template>
  <div class="MemberStatus">
    <div class="top">
      <div>
        <button class="blink" v-on:click="testNow" v-if="shared.me.connected">Blink Me</button>
      </div>
      <div class="members">
        <div
          v-for="m in shared.members"
          :key="m.id"
          class="member"
          :class="{connected: m.connected, highlight: m.highlight, voting: m.voting, votingOnViewer: shared.isViewer && m.voting, voted: m.voted, isAdmin: m.isAdmin, participating: m.participating}"
        >{{ m.name }}</div>
      </div>

      <div class="viewers">
        <div
          v-for="v in activeViewers"
          :key="v.id"
          class="viewer"
          :class="{highlight: v.highlight}"
        >{{ v.name }}</div>
      </div>
    </div>
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
    },
    activeViewers: function() {
      return this.shared.viewers.filter(v => v.id);
    }
  },
  mounted: function() {},
  methods: {
    testNow: function() {
      var vue = this;
      vue.shared.dbMe.update({
        highlight: true
      });

      setTimeout(function() {
        vue.shared.dbMe.update({
          highlight: false
        });
      }, 2000);
    }
  }
};
</script>

<style lang="less">
.MemberStatus {
  flex-shrink: 0;
  box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 2em;
    border-top: 1px solid #5d6560;
    border-bottom: 1px solid #5d6560;
    background: #e3e0cf;
  }

  .members,
  .viewers {
    padding: 5px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
  }

  .blink {
    font-size: 75%;
  }

  // .siteInfo {
  //   font-size: 80%;
  //   padding: 10px 0;
  //   background: #9fa8a3;
  //   color: #343c38;
  //   position: relative;
  //   .version {
  //     position: absolute;
  //     top: 0;
  //     right: 0;
  //     padding: 5px;
  //     background: #9fa8a3; // if squished, will cover text beside it
  //   }
  // }

  .viewer,
  .member {
    display: block;
    margin: 3px 10px;
    padding: 1px 3px;
    border-radius: 1px;

    &div.highlight { // include div to take priority
      animation: pulse 0.3s infinite;
    }
  }

  .viewer {
    background-color: #3f52ff;
    border: 1px solid #3f52ff;
    color: white;
  }

  .member {
    position: relative;
    border: 1px dashed #3f3fff;

    &.participating {
      border: 1px solid transparent;
    }

    &.connected {
      background-color: #c8c8ff;
      box-shadow: 0 0 2px 1px #6b5dff;
    }

    &.voting {
      //border-color: #fff;
      background-color: yellow;
    }

    &.votingOnViewer{
      animation: voting 1s linear infinite;
    }

    &.voted {
      border-color: #fff;
      background-color: #6bff5d;
    }

    &.isAdmin:after {
      content: "A"; // for Admin
      position: absolute;
      bottom: -5px;
      right: -8px;
      font-size: 60%;
    }
  }

  @keyframes pulse {
    0% {
      background-color: #fff;
    }
    50% {
      background-color: #ffba42;
    }
  }
  @keyframes voting {
    0% {
      background-color: #fff;
    }
    45% {
      background-color: yellow;
    }
    55% {
      background-color: yellow;
    }
    100% {
      background-color: #fff;
    }
  }
}
</style>
