
<template>
  <div class="MemberStatus">
    <div class="top">
      <div class="blinker">
        <button class="blink" v-on:click="testNow" v-if="shared.me.connected">Blink Me</button>
      </div>
      <div class="members">
        <div
          v-for="m in activeMembers"
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
          :class="{connected: v.connected, highlight: v.highlight}"
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
    },
    activeMembers: function() {
      return this.shared.members.filter(m => m.name);
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

  .viewers {
    justify-content: flex-end;
  }

  .blink {
    font-size: 75%;
  }

  .blinker,
  .viewers {
    min-width: 80px;
  }

  .viewer,
  .member {
    display: block;
    margin: 3px 10px;
    padding: 1px 3px;
    border-radius: 2px;

    &.connected.highlight {
      // include more selectors to take priority
      animation: pulse 0.3s infinite;
    }
  }

  .viewer {
    // background-color: #3f52ff;
    // border: 1px solid #3f52ff;
    color: #4a993e;
    margin: 3px 5px;
    font-weight: bold;
  }

  .member {
    position: relative;
    //border: 1px dashed #9a9a9a;
    background-color: rgba(100, 100, 100, 0.1);

    &.participating {
      //border: none;
      background-color: #ef9393;
      // box-shadow: 0 0 2px 1px red;
    }

    &.connected {
      background-color: #9fef93;
      // box-shadow: 0 0 2px 1px green;
    }

    &.voting {
      //border-color: #fff;
      background-color: #fdfd68;
    }

    &.votingOnViewer {
      // animation: voting 1s linear infinite;
    }

    &.voted {
      background-color: #9fef93;
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
      background-color: #4a993e;
    }
  }
  // @keyframes voting {
  //   0% {
  //     background-color: #fff;
  //   }
  //   45% {
  //     background-color: yellow;
  //   }
  //   55% {
  //     background-color: yellow;
  //   }
  //   100% {
  //     background-color: #fff;
  //   }
  // }
}
</style>
