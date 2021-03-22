<template>
  <div class="ClaimName">
    <div class="panel">
      <p>{{ $t('Welcome1') }}</p>
      <p>{{ $t('SelectLanguage') }}
        <button
          class="lang"
          :class="{active: $i18n.locale ==='en'}"
          v-on:click="shared.setLang('en')"
        >English</button>
        <button
          class="lang"
          :class="{active: $i18n.locale ==='fr'}"
          v-on:click="shared.setLang('fr')"
        >français</button>

      </p>
      {{ $i18n.locale }}

      <p>Please claim your name...</p>
      <table>
        <tr
          v-for="m in shared.members"
          :key="m.id"
          class="memberHolder"
          :class="{claimed: m.connected}"
        >
          <th>{{ m.name }}</th>
          <td>
            <button
              v-if="m.participating && !m.connected"
              :disabled="claimMade"
              v-on:click="claim(m)"
            >This is me!</button>
            <span v-if="m.connected">Claimed</span>
            <span v-if="!m.participating">Not Voting</span>
          </td>
        </tr>
      </table>
    </div>
    <div class="panel">
      <p>
        Or, if this browser will be used to display results, click
        <button v-on:click="claimViewer">Viewer</button>
      </p>
      <p>To use this computer as a voter <strong>and</strong> as a viewer, use an "In Private"/"Incognito" window for one of the sessions!</p>
    </div>
    <div
      v-if="!shared.me.id"
      class="panel"
    >
      <p>
        To forget about this election, click
        <button
          class="caution"
          v-on:click="logout"
        >
          Forget Election
        </button>
      </p>
      <p>An administrator can delete this election on the Setup page.</p>
    </div>
  </div>
</template>

<script>

import firebaseDb from "../firebaseInit";

export default {
  name: "ClaimName",
  data: function () {
    return {
      claimMade: false
    };
  },
  computed: {
    shared: function () {
      return this.$root.shared;
    }
  },
  updated: function () {
    if (this.shared.me.id) {
      // can't look here if already claimed?
      this.$router.replace("/e");
    }
  },
  methods: {
    claim: function (member) {
      if (member.connected) {
        // already claimed!
        return;
      }

      this.shared.claimMember(member.id);

      this.$router.replace("/e");
    },
    logout: function () {
      this.shared.logout();
    },
    claimViewer: function () {
      this.shared.startMeAsViewer();

      this.$router.replace("/e");
    },
  }
};
</script>

<style lang="less">
.ClaimName {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 10px;

  table {
    margin: 1em auto;
    th {
      font-weight: normal;
      padding-right: 40px;
    }
  }
  tr.memberHolder {
    height: 3em;
    cursor: pointer;
  }
  button {
    &.lang {
    }
    &.active {
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.5) inset;
    }
  }
}
</style>
