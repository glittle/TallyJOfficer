
<template>
  <div class="MemberStatus">
    <div class="top">
      <button class="blink" v-on:click="testNow" v-if="shared.me.connected">Blink Me</button>

      <div class="members">
        <div
          v-for="m in shared.members"
          :key="m.id"
          class="member"
          :class="{connected: m.connected, highlight: m.highlight, voting: m.voting, voted: m.voted, isAdmin: m.isAdmin, participating: m.participating}"
        >{{ m.name }}</div>
      </div>

      <div class="viewers">
        <div class="viewer" v-for="(m,i) in shared.viewers" :key="'v' + i">{{ m.code }}</div>
      </div>
    </div>

    <div class="siteInfo">
      <div v-if="shared.link">
        Shareable link to this election:
        <a :href="shared.link">{{shared.link}}</a>.
        <br>Be sure to keep a copy of this link - it is your team's secret key to this election!
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

  .members {
    padding: 5px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
  }

  .blink {
    font-size: 75%;
  }

  .siteInfo {
    font-size: 80%;
    padding: 5px 0 5px;
    background: #9fa8a3;
  }

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
    position: relative;
    background-color: #fff;
    border: 1px dashed #3f3fff;

    &.participating {
      border: 1px solid transparent;
      background-color: #d0d0d0;
    }

    &.connected {
      border-color: #3f3fff;
      background-color: #fff;
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

    &.voting {
      border-color: #fff;
      background-color: #ffba42;
      //animation: pulse 1s infinite;
    }

    &.highlight {
      animation: pulse 0.3s infinite;
    }

    @keyframes pulse {
      0% {
        background-color: #fff;
      }
      50% {
        background-color: #ffba42;
      }
    }
  }
}
</style>
