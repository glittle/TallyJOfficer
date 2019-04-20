<template>
  <div class="electionShell">
    <Nav/>
    <div class="electionBody" id="electionBody">
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
  name: "ElectionShell",
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
      // console.log("from", b && b.name, "to", a.name);
      // console.log(this.shared.me);
      if (!this.shared.me.id) {
        // console.log("go claim 1");
        this.$router.replace("/e/claim");
      } else if (a.name === "electionShell") {
        this.goCurrentHome();
      }
    }
  },
  mounted: function() {
    // console.log("mounted");
    if (this.$route.name === "join") {
      // console.log("mounted join");
      this.$router.replace("/e/claim");
    }
    this.shared.$on("election-loaded", this.electionLoaded);
    this.goCurrentHome();
  },
  beforeDestroy: function() {
    this.shared.$off("election-loaded", this.electionLoaded);
  },
  methods: {
    electionLoaded: function() {
      // console.log("loaded");
      this.goCurrentHome();
    },
    goCurrentHome: function() {
      // console.log(
      //   "go home",
      //   this.$route.name,
      //   this.shared.electionLoadAttempted,
      //   this.shared.electionKey
      // );
      if (this.shared.electionLoadAttempted) {
        if (!this.shared.electionKey) {
          // console.log("go create");
          this.$router.replace("/e/create");
          return;
        }
        if (!this.shared.me.id) {
          // console.log("go claim");
          this.$router.replace("/e/claim");
          return;
        }
      }

      if (this.$route.name === "electionShell") {
        // console.log("go root");
        if (this.shared.numBlankNames && this.shared.me.isAdmin) {
          // console.log("setup");
          this.$router.replace("/e/setupNames");
          return;
        }
      }

      this.$router.replace("/e/home");
    }
  }
};
</script>

<style lang="less">
.electionShell {
  height: 100%;
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