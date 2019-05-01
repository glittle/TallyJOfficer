<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  mounted: function() {
    document.addEventListener("touchmove", function(event) {
      event.preventDefault();
    });
  }
};
</script>

<style lang="less">
html {
  height: 100%;
}
body {
  font-family: "Open Sans", sans-serif;
  font-size: 1rem;
  color: #2c3e50;
  margin: 0;
  height: 100%;
  background-color: #e3e0cf;
}
#app {
  height: 100%;
}
p {
  font-family: "Open Sans", sans-serif;
}
input {
  font-size: inherit;
  padding: 2px 2px 0;
  border: none;
  border-bottom: solid 1px lightgray;
  margin: 0 20px 20px 10px;

  &[type="checkbox"] {
    margin: 0;
    border: inherit;
  }
}
h1 {
  font-size: 1.6em;
  margin: 0.5em 0;
}
h2 {
  font-size: 1.2em;
  margin: 0.5em 0;
}
h1,
h2 {
  font-family: "Acme", sans-serif;
  color: #1e331d;
}
.panel {
  background-color: white;
  // border: 1px solid #eaeaea;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  border-radius: 5px;
  padding: 10px 2ch 20px;
  margin: 10px auto 20px;
  max-width: 70ch;
}

button {
  display: inline-block;
  // font-family: "Acme", sans-serif;
  font-family: "Open Sans", sans-serif;
  //white-space: nowrap;
  text-align: center;
  vertical-align: baseline;
  font-size: 0.9em;
  padding: 4px 0.8em 5px;
  border-radius: 4px;
  margin: 0.1em 0.3em;
  border: none;
  background-color: #4a993e;
  color: #fff;
  cursor: pointer;

  &.primary {
    background-color: #3e4a99;
  }
  &.other {
    background-color: #fff;
    box-shadow: inset 0 0 2px 1px #4a993e;
    color: #333;
  }
  &.caution {
    background-color: #993e4a;
    font-size: 0.8em;
  }

  &:hover,
  &:active,
  &:focus,
  &:visited {
    text-decoration: none;
    color: #fff;
  }
  &:hover,
  &:focus {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
    &:hover,
    &:focus {
      box-shadow: none;
    }
  }

  &:active {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5) inset;
  }

  &.icon {
    display: flex;
    align-items: center;
    background-color: transparent;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
    padding: 0 10px 0 5px;
    min-width: 40px;
    margin: 0.1em 0.5em;
    color: #4a993e;
    i {
      margin: 4px -1px;
      font-size: 1.2em;
      display: inline-block;
    }
    span {
      padding: 0 0 0 3px;
    }
    &.primary {
      color: #3e4a99;
    }
    &.caution {
      color: #993e4a;
      font-size: 0.9em;
    }
  }
}
</style>
