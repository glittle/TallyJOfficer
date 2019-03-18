<template>
  <div class="Share">
    <div class="panel">
      <h2>Sharing this Election's Secret Link</h2>
      <div class="siteInfo">
        <p v-if="shared.link">
          Shareable link to this election:
          <a :href="shared.link">{{shared.link}}</a>.
        </p>
        <p>Be sure to keep a copy of this URL - it is your team's secret link to this election!</p>
        <p>Here is the same secret key in a QR Code format:
          <br>
          <qrcode
            :value="shared.link"
            :options="{ 
            width: 200,
            color:{
              light: '#f3f0dfff',
              dark: '#092c50ff'
            }
            }"
          ></qrcode>
        </p>
        <div class="version">Version {{version}}</div>
      </div>
    </div>
    <div class="panel">
      <h2>Sharing this App!</h2>
      <p>You can help! Please let other people know about this website / app!</p>
      <p>Twitter</p>
      <p>Facebook</p>
      <p>Instagram</p>
    </div>
  </div>
</template>

<script>
import _shared from "@/shared.js";
import firebaseDb from "../firebaseInit";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import Vue from "vue";

Vue.component(VueQrcode.name, VueQrcode);

export default {
  name: "Share",
  data: function() {
    return {};
  },
  computed: {
    shared: function() {
      return _shared;
    },
    version: function() {
      return _version;
    }
  },
  watch: {},
  methods: {}
};
</script>

<style lang="less">
.Share {
}
</style>
