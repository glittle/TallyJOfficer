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
  watch: {
    $route: function(a, b) {
      if (a.name === "electionRoot") {
        this.goCurrentHome();
      }
    }
  },
  mounted: function() {
    this.goCurrentHome();
  },
  methods: {
    goCurrentHome: function() {
      if (this.$route.name === "electionRoot") {
        if (!this.shared.myName) {
          this.$router.replace("/e/claim");
        } else {
          this.$router.replace("/e/home");
        }
      }
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