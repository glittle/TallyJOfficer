<template>
  <div class="SetupNames">
    <div class="panel">
      <h1>Set the names of the members</h1>
      <p>Use short names!</p>

      <div v-if="useQuickList" class="quickAdd">
        <button v-on:click="useQuickList = false">Hide Quick Add</button>
        <p>To quickly add members, enter their names in this box, one per line, then click "Add".</p>
        <textarea ref="quickList" v-model="quickList"></textarea>
        <button v-on:click="processQuickList">Add</button>
      </div>
      <button v-else v-on:click="openQuickList">Use Quick Add</button>

      <transition-group name="list" tag="div" class="list">
        <div
          class="itemHolder"
          v-for="(item,i) in shared.members"
          :key="item.id + i"
          :class="{claimed: item.connected}"
        >
          <span class="isDup">
            <span v-if="duplicatedNames[item.name]">Duplicate!</span>
          </span>
          
          <span class="num">{{i+1}}</span>
          
          <input type="text" v-on:change="updated" v-model="item.name">
          
          <label>
            <input type="checkbox" v-model="item.participating" v-on:change="updated">
            Voting
          </label>
          
          <label>
            <input type="checkbox" v-model="item.isAdmin" v-on:change="updated">
            Admin
          </label>
          
          <button class="remove caution" v-on:click="remove(i)">Remove</button>
        </div>
      </transition-group>
      <p v-if="warning" class="warning">{{warning}}</p>
      <button v-on:click="add">Add Another Member</button>
      <p>If a member is not able to participate in this voting, uncheck their "Voting" mark.</p>
      <p>Anyone marked as "Admin" is able to open and close voting and set up the names of members and positions. You must have at least one person marked as an admin.</p>
    </div>
  </div>
</template>

<script>
import _shared from "@/shared.js";
import firebaseDb from "../firebaseInit";

export default {
  name: "SetupNames",
  data: function() {
    return {
      duplicatedNames: {},
      quickList: "",
      warning: "",
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
      if (vue.shared.numBlankNames && vue.shared.me.isAdmin) {
        vue.useQuickList = true;
      }
    });
  },
  methods: {
    openQuickList: function() {
      this.useQuickList = true;
      this.$nextTick(() => this.$refs.quickList.focus());
    },
    processQuickList: function() {
      var names = this.quickList.split(/\n/);
      names.forEach(n => {
        n = n.trim();
        if (!n) return;

        var nextEmpty = this.shared.members.find(item => !item.name);
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
      // var vue = this;
      var toRemove = this.shared.members[i];

      var adminFound =
        this.shared.members.filter(m => m.id !== toRemove.id && m.isAdmin)
          .length > 0;
      if (!adminFound) {
        this.warning = "Cannot remove an Admin!";
        return;
      }
      this.warning = "";

      var path = `members/${this.shared.electionKey}/${toRemove.id}`;
      console.log("remove", path);
      firebaseDb
        .ref(path)
        .remove()
        .then(() => this.testForDuplicates());

      // var removed = this.shared.members.splice(i, 1)[0];
      // var ref = this.shared.dbElectionRef;
      // const dbList = ref.collection("members");
      // dbList
      //   .doc(removed.id)
      //   .delete()
      //   .then(function() {
      //     vue.updated(true);
      //   });
    },
    add: function(i) {
      var newMember = this.shared.makeMember("", this.shared.members);
      var path = `members/${this.shared.electionKey}/${newMember.id}`;
      console.log("add", path);
      firebaseDb
        .ref(path)
        .set(newMember);
    },
    updated: function(wasUpdated) {
      this.shared.members.sort((a, b) =>
        (a.name || "Z") < (b.name || "Z") ? -1 : 1
      );

      var dupFound = this.testForDuplicates();

      var adminFound = this.shared.members.filter(m => m.isAdmin).length > 0;

      if (!adminFound) {
        this.warning = "Please mark at least one Admin!";
        return;
      }
      this.warning = "";

      if (!dupFound && wasUpdated) {
        var ref = this.shared.dbElectionRef;
        if (ref) {
          // const dbList = ref.collection("members");
          this.shared.members.forEach(m =>
            firebaseDb.ref(`members/${this.shared.electionKey}/${m.id}`).set(m)
          );
          // this.shared.members.forEach(item => {
          //   dbList.doc(item.id).set(item);
          // });
          // this.editsMade = false;
        }
      }
    },
    testForDuplicates: function() {
      var nameCount = {};
      this.shared.members.forEach(item => {
        var name = item.name;
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
  textarea {
    width: 70px;
    height: 11em;
    display: block;
    font-family: inherit;
    font-size: 1em;
    margin: -10px auto 10px;
    text-align: center;
    white-space: nowrap;
  }
  .list {
    margin: 20px 0;
    .itemHolder {
      margin: 10px 0;
    }
    .isDup {
      display: inline-block;
      width: 100px;
    }
    input[type="text"] {
      width: 5em;
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
      margin: 0 0 0 20px;
    }
  }
  .quickAdd {
    margin: 0 auto 20px;
    width: 60%;
  }
  .list-move {
    transition: transform 1s;
  }
  p.warning {
    color: #993e4a;
  }
}
</style>
