<template>
  <div class="SetupNames">
    <p>Welcome to your Officer Election!</p>
    <p>Set the names of the members here.</p>
    <div v-if="useQuickList">
      <p>To quickly add member, enter their first names in this box, one per line, then click "Add".</p>
      <textarea v-model="quickList"></textarea>
      <button v-on:click="processQuickList">Add</button>
    </div>
    <button
      v-on:click="useQuickList = !useQuickList"
      v-text="useQuickList ? 'Hide Quick Add' : 'Use Quick Add'"
    />
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
        
        <label>
          <input type="checkbox" v-model="m.isAdmin" v-on:change="updated">
          Admin
        </label>
        
        <button class="remove" v-on:click="remove(i)">Remove</button>
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
      quickList: "",
      useQuickList: false
      // editsMade: false
    };
  },
  computed: {
    shared: function() {
      return _shared;
    }
  },
  watch: {
    // 'shared.members': {
    //   handler: function(a, b) {
    //     this.editsMade = true;
    //   },
    //   deep: true
    // }
  },
  mounted: function() {
    var vue = this;
    this.updated();
    this.shared.$on("election-loaded", function() {
      if (vue.shared.numBlankNames) {
        vue.useQuickList = true;
      }
    });
  },
  methods: {
    processQuickList: function() {
      var names = this.quickList.split(/\n/);
      names.forEach(n => {
        n = n.trim();
        if (!n) return;

        var nextEmpty = this.shared.members.find(m => !m.name);
        if (nextEmpty) {
          nextEmpty.name = n;
        } else {
          this.shared.members.push(
            this.shared.makeMember(n, this.shared.members)
          );
        }
      });
      this.useQuickList = false;
      this.quickList = "";
      this.updated(true);
    },
    remove: function(i) {
      var vue = this;
      var removed = this.shared.members.splice(i, 1)[0];
      var ref = this.shared.dbElectionRef;
      const dbMembers = ref.collection("members");
      dbMembers
        .doc(removed.id)
        .delete()
        .then(function() {
          vue.updated(true);
        });
    },
    add: function(i) {
      this.shared.members.push(this.shared.makeMember("", this.shared.members));
    },
    updated: function(wasUpdated) {
      this.shared.members.sort((a, b) =>
        (a.name || "Z") < (b.name || "Z") ? -1 : 1
      );

      var dupFound = this.testForDuplicates();

      if (!dupFound && wasUpdated) {
        var ref = this.shared.dbElectionRef;
        if (ref) {
          const dbMembers = ref.collection("members");
          this.shared.members.forEach(m => {
            dbMembers.doc(m.id).set(m);
          });
          // this.editsMade = false;
        }
      }
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

      return Object.keys(vue.duplicatedNames).length !== 0;
    }
  }
};
</script>

<style lang="less">
.SetupNames {
  table {
    margin: 1em auto;
  }
  textarea {
    width: 60px;
    height: 11em;
    display: block;
    font-family: inherit;
    margin: 0 auto;
    padding-left: 3px;
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
    label {
      display: inline-block;
      margin: 0 5px;
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
