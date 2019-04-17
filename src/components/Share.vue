<template>
  <div class="Share">
    <div v-if="shared.link" class="panel">
      <h2>This Election's Secret Link</h2>
      <div class="siteInfo">
        <p>Copy and share this link to your election with your team:</p>
        <p>
          <a :href="shared.link">{{shared.link}}</a>.
        </p>
        <p>Be sure to keep a copy of this URL - it is the only way to get to this election!</p>
        <p>Here is the same secret link in a QR Code format if members of your team can use it:</p>
        <p>
          <qrcode :options="{ width: qrWidth }" :value="shared.link"></qrcode>
        </p>
      </div>
    </div>
    <div class="panel">
      <h2 id="testHeader">Spread the news!</h2>
      <p>You can help! Please let other people know about this web application!</p>
      <p>Twitter</p>
      <p>Facebook</p>
      <p>Instagram</p>
      <p class="version">Version {{version}}</p>
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
    return {
      qrWidth: 200
    };
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
  mounted: function() {
    window.addEventListener("resize", this.resize);
    this.resize();
  },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.resize);
  },
  methods: {
    resize: function() {
      var body = window.document.getElementById('electionBody');
      var newSize = 0.9 * Math.min(window.document.getElementById('testHeader').clientWidth, body.clientWidth, body.clientHeight);
      this.qrWidth = newSize;
    }
  }
};
</script>

<style lang="less">
.Share {
  canvas {
  }
}
</style>
