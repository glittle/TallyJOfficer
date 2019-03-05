<template>
  <div class="guidance panel">
    <button class="goBack" v-on:click="goBack">Go Back</button>
    <p>Guidance regarding the election of officers to Baha'i Assemblies.</p>
    <a name="General"/>
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

    <hr>
    <a name="Chair"/>
    <h1>Chair</h1>

    <blockquote>sfdsf</blockquote>
    <blockquote>sfdsf</blockquote>
    <hr>
    <a name="ViceChair"/>
    <h1>Vice-Chair</h1>
    <blockquote>sfdsf</blockquote>
    <blockquote>sfdsf</blockquote>
    <blockquote>sfdsf</blockquote>
    <blockquote>sfdsf</blockquote>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Guidance",
  methods: {
    goBack: function() {
      history.go(-1); // not sure why -1 doesn't work
    }
  }
};
</script>

<style lang="less">
.guidance {
  padding: 1em;
  font-family: serif;
  h1,
  h2 {
    font-family: "Acme", sans-serif;
    color: #1e331d;
  }
  button{
    font-family: "Acme", sans-serif;
  }
  blockquote {
    margin: 1em 1em;
  }
  hr {
    margin: 2em 0 1em;
  }
}
</style>
