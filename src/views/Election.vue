<template>
  <div class="election">
    <Nav/>
    <router-view/>
    <MemberStatus :shared="shared"/>
  </div>
</template>

<script>
import Nav from "@/components/Nav.vue";
import MemberStatus from "@/components/MemberStatus.vue";
import shared from "@/shared.js";

export default {
  name: "Election",
  components: {
    MemberStatus,
    Nav
  },
  computed: {
    shared: function() {
      return shared;
    }
  },
  mounted: function() {}
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
}
</style>