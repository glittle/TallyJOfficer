<template>
  <div class="election">
    <Nav/>
    <div class="electionBody">
      <router-view/>
    </div>
    <MemberStatus/>
  </div>
</template>

<script>
import Nav from "@/components/Nav.vue";
import MemberStatus from "@/components/MemberStatus.vue";
import _shared from "@/shared.js";

export default {
  name: "Election",
  components: {
    MemberStatus,
    Nav
  },
  computed: {
    shared: function() {
      return _shared;
    }
  },
  mounted: function() {
    if (!this.shared.myName) {
      this.$router.replace("/e/claim");
    }
  }
};
</script>

<style lang="less">
body {
  margin: 0;
}

.election {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .electionBody {
    flex-grow: 1;
    overflow: auto;
  }
}
</style>