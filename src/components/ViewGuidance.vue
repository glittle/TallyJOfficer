<template>
  <div class="ViewGuidance">
    <button class="goBack" v-on:click="goBack">Go Back</button>
    <a name="General"></a>
    <h1>General</h1>

    <blockquote>
      <h2>96. If All Members Present, Permanent Officers Should Be Elected Immediately</h2>
      <p>
        “While it is certainly true that the permanent officers of an Assembly should be elected immediately
        following the election of that Assembly, it is equally important, as stated in Article IV of the By-laws of
        the National Assembly, that ‘The officers shall be elected by a majority vote of the entire membership of
        the Assembly taken by secret ballot.’ That is all members of the Assembly must be properly notified and
        given an opportunity to vote, and in cases of unavoidable absence it does not contravene the spirit of the
        By-laws if the absent member should cast his ballot by mail or even by telephone.
      </p>
      <p>“Temporary officers may be elected until all nine are properly notified of the election.”</p>
      <cite>(From a letter written on behalf of the Universal House of Justice to a National Spiritual Assembly, July 27, 1981)</cite>
    </blockquote>

    <blockquote>
      <h2>97. Assembly or Committee Members May Excuse Themselves from Being Elected as Officers</h2>
      <p>
        “We have also been asked to point out that although it is the obligation of a Bahá’í to serve on an
        Assembly, either Local or National, when elected, on several occasions the beloved Guardian pointed
        out that before the election of officers, if any member had a good reason in his own opinion why he
        should not be elected to one of the offices of the Assembly, he was free to suggest that he should not be
        so elected. The House of Justice also feels that as the work of the Faith expands and the duties of
        officers, particularly on National Spiritual Assemblies, acquire more importance, it is permissible and at
        times advisable to discuss the duties incumbent upon and required of each officer before ballots are
        cast.”
      </p>
      <cite>(From a letter written on behalf of the Universal House of Justice to an individual believer, February 9, 1987)</cite>
    </blockquote>

    <a name="Chair"></a>
    <h1>Chair</h1>

    <blockquote>sfdsf</blockquote>
    <blockquote>sfdsf</blockquote>
    <a name="ViceChair"></a>
    <h1>Vice-Chair</h1>
    <blockquote>sfdsf</blockquote>
    <blockquote>sfdsf</blockquote>
    <blockquote>sfdsf</blockquote>
    <blockquote>sfdsf</blockquote>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "ViewGuidance",
  data: function() {
    return {};
  },
  watch: {
    $route: "moveToPosition"
  },
  computed: {
    shared: function() {
      return _shared;
    },
    position: function() {
      return this.shared.positions.find(p => p.isActive);
    }
  },
  mounted: function() {
    // var vue = this;
    this.moveToPosition();
  },
  methods: {
    moveToPosition: function() {
      location.hash = this.position.name;
    },
    goBack: function() {
      this.$router.go(-2); // not sure why -1 doesn't work
    }
  }
};
</script>

<style lang="less">
.ViewGuidance {
  text-align: left;
  padding: 0 0 0 15px;
  .goBack {
    position: fixed;
    top: 3em;
    right: 3px;
  }
  a[name] {
    display: block;
    height: 1em;
  }
  h1 {
    margin-bottom: 0;
  }
  blockquote {
    padding-bottom: 15px;
    padding-top: 25px;
    margin-top: 0;
    margin-bottom: 0;

    h2 {
      font-size: 1.1em;
      margin-top: 0;
    }
    cite {
      font-size: 85%;
    }
  }
  blockquote + blockquote {
    border-top: 1px solid lightgray;
  }
}
</style>
