<template>
  <div class="election">
    <Nav/>
    <div class="electionBody">
      <router-view/>
    </div>
    <MemberStatus v-if="$route.name !== 'createElection'"/>
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
  beforeUpdate: function() {
    // console.log('election - before update');
    // this.goCurrentHome();
  },
  methods: {
    goCurrentHome: function() {
      if (!this.shared.electionLoadAttempted || !this.shared.electionKey) {
        this.$router.replace("/e/create");
        return;
      }

      if (this.$route.name === "electionRoot") {
        if (!this.shared.me.id) {
          this.$router.replace("/e/claim");
        } else if (this.shared.numBlankNames && this.shared.me.isAdmin) {
          this.$router.replace("/e/setupNames");
        } else {
          this.$router.replace("/e/home");
        }
      }
    }
  }
};
</script>

<style lang="less">
.election {
  height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .electionBody {
    flex-grow: 1;
    overflow: auto;
  }
}
</style>