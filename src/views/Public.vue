<template>
  <div class="public panel">
    <img alt="TallyJ logo" class="logo" src="../../public/img/LogoSq500.png">
    <h1>TallyJ for Officers</h1>
    <p>When a group of individuals form a team of peers, one of the first orders of business is to elect some of their members to positions of responsibility.</p>
    <p>This website provides a way for your team to quickly and easily vote online by secret ballot to choose who will serve in those positions.</p>
    <p>To start, or return to, your team's election, click here:</p>
    <p>
      <button v-on:click="$router.push('/e')">My Election</button>
    </p>
    <img class="team" src="../../public/img/team.png">

    <h1>Learn More</h1>
    <p>
      Got questions? Here are some <a href="faq">Questions and Answers</a> about how this website works.
    </p>
    <h1>Sample Uses</h1>
    <p>Whenever responsibilities need to be assigned to team members, TallyJ for Officers can help!</p>
    <p>Samples of where this might be useful:</p>
    <ul class="samples">
      <li>
        <h3>Club</h3>
        <p>President, Vice President, Secretary, Treasurer</p>
      </li>
      <li>
        <h3>Bahá'í Assembly</h3>
        <p>Chairperson, Vice-Chairperson, Secretary, Treasurer</p>
        <p>
          The Bahá'í community has
          <a href="guidance">guidance</a> regarding various aspects of electing officers.
        </p>
      </li>
      <li>
        <h3>Board of Directors</h3>
        <p>Chief Executive Officer, Chief Operating Officer, Chief Financial Officer, Secretary</p>
      </li>
      <li>
        <h3>Church Presbytery</h3>
        <p>Moderator, Principal Clerk</p>
      </li>
      <li>
        <h3>Housing Committee</h3>
        <p>Chairperson, Secretary, Treasurer</p>
      </li>
      <li>
        <h3>College Assignment</h3>
        <p>Researcher, Writer, Editor</p>
      </li>
      <li>
        <h3>Family Dinner time</h3>
        <p>Cook, Table-setter, Cleanup</p>
      </li>
      <li>
        <h3>Road Trip</h3>
        <p>Driver, Navigator</p>
      </li>
      <li>
        <h3>Survivor Challenge (TV Show)</h3>
        <p>Swimmer, Rope Puller, Puzzle Solver</p>
      </li>
    </ul>
    <h1>Spread the News!</h1>
    <p>Help are some links to help you share the news about TallyJ for Officers with your friends...</p>
    <div class="sharethis-inline-share-buttons"></div>
    <p>Version {{version}}</p>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Public",
  computed: {
    version: function() {
      return _version;
    }
  }
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
    &.logo {
      width: 100px;
      max-width: 25%;
      float: right;
      margin: 1em 0 1em 1em;
    }
    &.team {
      display: block;
      margin: 1em 0;
      height: 300px;
      border-radius: 5px;
      box-shadow: 0 0 1px 0px black;
    }
  }
  blockquote {
    margin: 1em 1em;
  }
  hr {
    margin: 2em 0 1em;
  }
  .samples {
    li {
      list-style-type: none;
      h3 {
        margin: 10px 0 -10px -20px;
      }
    }
  }
}
</style>