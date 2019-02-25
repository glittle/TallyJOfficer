<template>
  <div class="SetupNames">
    <p>Welcome to your Officer Election!</p>
    <p>Set the names of the members here.</p>
    <textarea v-model="quickList">
    </textarea>
    <button v-on:click="processQuickList">Add</button>
    <transition-group name="list" tag="div" class="namesList">
      <div
        class="memberHolder"
        v-for="(m,i) in shared.members"
        :key="m.id"
        :class="{claimed: m.connected}"
      >
        <span class="isDup">
          <span v-if="duplicatedNames[m.name]">Duplicate!</span>
        </span>
        
        <span class="num">{{i+1}}</span>
        
        <input type="text" v-on:change="updated" v-model="m.name">
        
        <button class="remove" v-on:click="remove(i)">Remove</button>
        
        <label>
          <input type="checkbox" v-model="m.isAdmin">
          Admin
        </label>
      </div>
    </transition-group>

    <button v-on:click="add">Add Another</button>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "SetupNames",
  data: function() {
    return {
      duplicatedNames: {},
      quickList: ''
    };
  },
  computed: {
    shared: function() {
      return _shared;
    }
  },
  mounted: function() {
    // var vue = this;
    this.updated();
  },
  methods: {
    processQuickList: function(){

    },
    remove: function(i) {
      this.shared.members.splice(i, 1);
      this.testForDuplicates();
    },
    add: function(i) {
      this.shared.members.push(this.shared.makeMember('', this.shared.members));
    },
    updated: function() {
      this.shared.members.sort((a, b) =>
        (a.name || "Z") < (b.name || "Z") ? -1 : 1
      );
      this.testForDuplicates();
    },
    testForDuplicates: function() {
      var nameCount = {};
      this.shared.members.forEach(m => {
        var name = m.name;
        if (!nameCount[name]) {
          nameCount[name] = 1;
        } else {
          nameCount[name]++;
        }
      });

      var vue = this;
      vue.duplicatedNames = {};
      Object.keys(nameCount).forEach(name => {
        if (name && nameCount[name] > 1) {
          vue.duplicatedNames[name] = true;
        }
      });
    }
  }
};
</script>

<style lang="less">
.SetupNames {
  table {
    margin: 1em auto;
  }
  .namesList {
    margin-right: 100px; // offset for isDup
    .memberHolder {
      margin: 10px 0;
    }
    .isDup {
      display: inline-block;
      width: 100px;
    }
    .num {
      display: inline-block;
      width: 20px;
      text-align: right;
      margin: 0 5px 0 5px;
      font-size: 75%;
      color: grey;
    }
    .remove {
      margin: 0 5px;
    }
  }
  .list-move {
    transition: transform 1s;
  }
}
</style>
