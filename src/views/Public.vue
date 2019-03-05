<template>
  <div class="public">
    <img alt="TallyJ logo" src="../assets/logo.png">
    <h1>Welcome to TallyJ for Officers elections.</h1>
    <p>
      This is exclusively designed to assist any small team when electing their own officers.
      The rules followed are as specified for Bahá'í assemblies.
    </p>
    <p>To create your own election now, press here:</p>
    <!-- <button>Create an Election</button> -->
    <router-link to="/e">Election Home</router-link>
    <hr>
    <h2>Learn More</h2>
    <p>
      When a group of individuals form a team (Bahá'í Assembly, committee or other), one of the first
      orders of business is to elect their own officers. For each officer position, the members vote for
      one of their own to serve in that capacity.
    </p>
    <p>The officer positions vary by team but typically include "Chair", "Secretary", "Vice-Chair" and "Treasurer".</p>
    <p>Here is some
      <a href="guidance" target="guidance">guidance</a>
       regarding Bahá'í officer positions.
    </p>
    <p>
      Share on Facebook, Twitter, Instagram...
    </p>
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
  max-width: 700px;
  margin: 20px auto;
  hr {
    margin: 2em 0 1em;
  }
}
</style>