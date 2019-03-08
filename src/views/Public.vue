<template>
  <div class="public panel">
    <img alt="TallyJ logo" src="../assets/logo.png">
    <h1>TallyJ for Officers</h1>
    <p>Small teams should use this app when electing their officers.</p>
    <p>To create your own election now, press here:</p>
    <!-- <button>Create an Election</button> -->
    <p>
      <em>
        <strong>March 2018</strong> This app is in beta... Contact
        <a href="mailto:Glen.Little@gmail.com">Glen Little</a> for details.
      </em>
    </p>
    <p>
      <button v-on:click="$router.push('/e')">Election Home</button>
    </p>
    <hr>
    <h2>Learn More</h2>
    <p>
      <img src="../../public/img/team.png" class="left">
      When a group of individuals form a team (a Bahá'í Assembly, committee or other), one of the first
      orders of business is to elect their own officers. The members vote by secret ballot for
      one of their own to serve in each officer position.
    </p>
    <p>The officer positions vary by team but typically include "Chair", "Secretary", "Treasurer" and "Vice-Chair".</p>
    <p>
      The Bahá'í community has
      <a href="guidance" target="guidance">guidance</a> regarding various aspects of electing officers.
    </p>
    <p>Share on Facebook, Twitter, Instagram...</p>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Public"
};
</script>

<style lang="less">
.public {
  padding: 1em;
  font-family: "Open Sans", sans-serif;
  h1,
  h2 {
    font-family: "Acme", sans-serif;
    color: #1e331d;
  }
  button {
    font-family: "Open Sans", sans-serif;
  }
  img {
    &.left {
      float: left;
      margin: 0 1em 0.5em 0;
      box-shadow: 1px 1px 2px 1px #d0d0d0;
    }
  }
  blockquote {
    margin: 1em 1em;
  }
  hr {
    margin: 2em 0 1em;
  }
}
</style>