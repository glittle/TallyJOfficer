<template>
  <div class="SetupNames">
    <div
      v-if="shared.election.votingOpen"
      class="panel"
    >
      <p class="isVoting">Voting is in progress.</p>
      <p>Modifying team members and positions cannot be done while a position is being voted on.</p>
    </div>
    <div
      v-if="!shared.election.votingOpen"
      class="panel"
    >
      <h1>1. Members</h1>
      <p>Use short names!</p>

      <div
        v-if="useQuickList"
        class="quickAdd"
      >
        <p>To quickly add members, enter or paste their names into this box, one per line, then click "Add Now".</p>
        <textarea
          ref="quickList"
          v-model="quickList"
        ></textarea>
        <button
          :disabled="quickListNames.length===0"
          v-on:click="processQuickList"
        >Add
          <span
            v-if="quickListNames.length > 1"
            v-text="quickListNames.length + ' names'"
          ></span> Now</button>
        <br>
        <button
          class="other"
          v-on:click="useQuickList = false, editing = true, quickList = ''"
        >Cancel Adding Multiple</button>
      </div>
      <div v-if="editing">
        <transition-group
          name="list"
          tag="div"
          class="list"
        >
          <div
            v-for="(item,i) in shared.members"
            :key="item.id"
            class="itemHolder"
            :class="{claimed: item.connected}"
          >
            <div>
              <span class="num">{{ i+1 }}</span>

              <input
                v-model="item.name"
                type="text"
                :class="{missing: !item.name}"
                v-on:change="updated"
              >

              <label>
                <input
                  v-model="item.participating"
                  type="checkbox"
                  v-on:change="updated"
                >
                Voting
              </label>

              <label>
                <input
                  v-model="item.isAdmin"
                  type="checkbox"
                  v-on:change="updated"
                >
                Admin
              </label>
              <div
                v-if="duplicatedNames[item.name.toLocaleLowerCase()]"
                class="isDup"
              >
                <span>Duplicate!</span>
              </div>

            </div>
            <div class="part2">
              <button
                class="icon remove caution"
                v-on:click="remove(i)"
              >
                <i class="material-icons">delete</i>
                <span>Remove</span>
              </button>
            </div>
          </div>
        </transition-group>
        <p
          v-if="warning"
          class="warning"
        >{{ warning }}</p>
        <button v-on:click="add">
          Add One
        </button>
        <button
          v-if="!useQuickList"
          v-on:click="openQuickList"
        >Add Multiple</button>
        <p>If a member is not voting today, uncheck their "Voting" mark.</p>
        <p>Anyone marked as "Admin" is able to open and close voting and set up the names of members and positions. You must have at least one person marked as an admin.</p>
      </div>
    </div>
  </div>
</template>

<script>

import firebaseDb from "../firebaseInit";

export default {
  name: "SetupNames",
  data: function () {
    return {
      duplicatedNames: {},
      quickList: "",
      warning: "",
      useQuickList: false,
      editing: true
      // editsMade: false
    };
  },
  computed: {
    shared: function () {
      return this.$root.shared;
    },
    quickListNames: function () {
      return this.quickList.split(/\n/g).filter(s => s);
    }
  },
  watch: {
    // 'shared.members': {
    //   handler: function(a, b) {
    //     this.editsMade = true;
    //   },
    //   deep: true
    // }
    quickList: function (a, b) {
      var byComma = a.split(/,/g);
      if (byComma.length > 1) {
        this.quickList = byComma.join("\n");
      }
    }
  },
  mounted: function () {
    this.shared.$on("election-changed", this.electionLoaded);
    this.useQuickOnOpen();
    this.testForDuplicates();
  },
  beforeDestroy: function () {
    this.shared.$off("election-changed", this.electionLoaded);
  },
  methods: {
    electionLoaded: function () {
      this.updated();
      this.useQuickOnOpen();
    },
    useQuickOnOpen: function () {
      var vue = this;
      if (vue.shared.numNonBlankNames === 1 && vue.shared.me.isAdmin) {
        vue.useQuickList = true;
        vue.editing = false;
      }
    },
    openQuickList: function () {
      this.useQuickList = true;
      this.$nextTick(() => this.$refs.quickList.focus());
    },
    processQuickList: function () {
      var names = this.quickListNames;
      names.forEach(n => {
        n = n.trim();
        if (!n) return;

        if (this.shared.members.find(item => item.name.toLocaleLowerCase() === n.toLocaleLowerCase())) {
          // skip duplicates
          return;
        }

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
      this.editing = true;
      this.quickList = "";
      this.updated(true);
    },
    remove: function (i) {
      var vue = this;
      var toRemove = this.shared.members[i];

      var adminFound =
        this.shared.members.filter(m => m.id !== toRemove.id && m.isAdmin)
          .length > 0;
      if (!adminFound) {
        this.warning = "Cannot remove an Admin!";
        return;
      }
      this.warning = "";

      var path1 = `/voterSymbols/${this.shared.electionKey}/${toRemove.id}`;

      firebaseDb
        .ref(path1)
        .on('value', function (snapshot) {
          var info = snapshot.val();
          var symbol = null;
          if (info) {
            symbol = info.symbol;
          }
          if (symbol) {
            // remove the current vote for this removed account
            var path2 = `/voting/${vue.shared.electionKey}/votes/${symbol}`;
            console.log("remove", path2);
            firebaseDb
              .ref(path2)
              .remove();
          }

          console.log("remove", path1);
          firebaseDb
            .ref(path1)
            .remove();
        })

      var path3 = `/members/${this.shared.electionKey}/${toRemove.id}`;
      console.log("remove", path3);
      firebaseDb
        .ref(path3)
        .remove()
        .then(() => this.testForDuplicates());

      // may be redundant... not allowed to delete a person if voting is active
      this.shared.cancelVoting();

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
    add: function (i) {
      var newMember = this.shared.makeMember("", this.shared.members);
      var path = `/members/${this.shared.electionKey}/${newMember.id}`;
      console.log("add", path);
      firebaseDb.ref(path).set(newMember);
      this.shared.cancelVoting();
    },
    updated: function (wasUpdated) {
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
            firebaseDb.ref(`/members/${this.shared.electionKey}/${m.id}`).set(m)
          );
          // this.shared.members.forEach(item => {
          //   dbList.doc(item.id).set(item);
          // });
          // this.editsMade = false;
          this.shared.cancelVoting();
        }
      }
    },
    testForDuplicates: function () {
      var nameCount = {};
      this.shared.members.forEach(item => {
        var name = item.name.toLocaleLowerCase();
        if (!nameCount[name]) {
          nameCount[name] = 1;
        } else {
          nameCount[name]++;
        }
      });

      var vue = this;
      vue.duplicatedNames = {};
      Object.keys(nameCount).forEach(name => {
        name = name.toLocaleLowerCase();
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
      margin: 20px 15px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      > div {
        white-space: nowrap;
        margin: 2px;
      }
    }
    .isDup {
      color: red;
      margin-left: 6em;
      text-align: left;
    }
    input[type="text"] {
      width: 5em;
      margin: 0 20px 0 10px;
      &.missing {
        background-color: rgba(255, 0, 0, 0.14);
      }
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
  .isVoting {
    color: red;
    font-weight: bold;
    font-size: 1.1em;
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
