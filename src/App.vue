<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="less">
body {
  font-family: "Acme", sans-serif;
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0;
  background-color: #ededed;
}
input {
  font-size: inherit;
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
  padding: 10px;
  margin: 10px auto;
  max-width: 700px;
}

button {
  display: inline-block;
  font-family: inherit;
  white-space: nowrap;
  text-align: center;
  vertical-align: middle;
  height: 2em;
  font-size: 0.8em;
  padding: 0 0.8em;
  border-radius: 4px;
  margin: 0.1em 0.3em;
  border: none;
  background-color: #4a993e;
  color: #fff;
  cursor: pointer;

  &.primary {
    background-color: #3e4a99;
  }
  &.caution {
    background-color: #993e4a;
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
}
</style>
