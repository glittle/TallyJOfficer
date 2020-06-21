<template>
  <div class="SetupPositions">
    <div
      v-if="!shared.election.votingOpen"
      class="panel"
    >
      <h1>2. Define the positions to be voted for</h1>
      <p>Add, edit and sort positions as desired by your team.</p>
      <p>A "Sample" position is included for your team to use to practice with.</p>
      <slick-list
        v-model="list"
        class="list"
        helper-class="moving"
        lock-axis="y"
        :use-drag-handle="true"
        v-on:input="listSorted"
      >
        <slick-item
          v-for="(item,i) in list"
          :key="item.id"
          class="positionItemHolder"
          :index="i"
        >
          <span class="num">{{ i+1 }}</span>

          <input
            v-model="item.name"
            type="text"
            v-on:change="updated"
          >

          <button
            v-handle
            class="moveMe icon"
          >
            <i class="material-icons">arrow_upward</i>
            <i class="material-icons">arrow_downward</i>
            <span>Move</span>
          </button>

          <button
            class="icon remove caution"
            v-on:click="remove(i)"
          >
            <i class="material-icons">delete</i>
            <span>Remove</span>
          </button>
        </slick-item>
      </slick-list>

      <button v-on:click="add">
        Add Another
      </button>

    </div>

    <div class="panel">
      <h3>"I have a good reason..."</h3>
      <p>
        As quoted on the Guidance page, the "<em>Guardian pointed out that before
          the election of officers, if any member had a good reason in his own opinion why he should not be elected
          to one of the offices of the Assembly, he was free to suggest that he should not be so elected.</em>"
      </p>
      <p>If the following box is checked, TallyJ for Officers will show a check box during voting for each position
        to allow members to indicate whether this applies to them.
        If you have already discussed whether anyone has reasons to not be elected to one of the offices,
        you may want to leave this turned off.
      </p>
      <div>
        <label>
          <input
            v-model="shared.election.showPreferNot"
            type="checkbox"
            v-on:change="changedPreferNot"
          >
          Show the "I have a good reason..." checkbox when voting.
        </label>
      </div>

    </div>
  </div>
</template>

<script>

import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";
import firebaseDb from "../firebaseInit";

export default {
  name: "SetupPositions",
  components: {
    SlickList,
    SlickItem
  },
  directives: { handle: HandleDirective },
  data: function () {
    return {
      preferNot: false
    };
  },
  computed: {
    shared: function () {
      return this.$root.shared;
    },
    list: {
      get: function () {
        return this.shared.positions;
      },
      set: function (a) {
        this.shared.positions = a;
      }
    }
  },
  watch: {},
  mounted: function () { },
  methods: {
    // remove: function(i) {
    //   this.shared.positions.splice(i, 1);
    // },
    // add: function(i) {
    //   this.shared.positions.push(this.shared.makePosition(""));
    // },
    remove: function (i) {
      // var vue = this;
      var toRemove = this.list[i];
      firebaseDb
        .ref(`/positions/${this.shared.electionKey}/${toRemove.id}`)
        .remove();

      // var removed = this.list.splice(i, 1)[0];

      // var ref = this.shared.dbElectionRef;
      // const dbList = ref.collection("positions");
      // dbList
      //   .doc(removed.id)
      //   .delete()
      //   .then(function() {
      //     vue.updated();
      //   });
    },
    changedPreferNot() {
      firebaseDb.ref(`/elections/${this.shared.electionKey}`).update({
        showPreferNot: this.shared.election.showPreferNot
      });
    },
    add: function () {
      this.list.push(this.shared.makePosition("", this.list));
      this.listSorted(this.list);
    },
    listSorted: function (list) {
      list.forEach((p, i) => (p.sortOrder = i));
      this.updated();
    },
    updated: function () {
      this.list.forEach(m =>
        firebaseDb.ref(`/positions/${this.shared.electionKey}/${m.id}`).set(m)
      );

      this.shared.cancelVoting();

      // var ref = this.shared.dbElectionRef;
      // if (ref) {
      //   const dbList = ref.collection("positions");
      //   this.list.forEach(item => {
      //     dbList.doc(item.id).set(item);
      //   });
      // }
    }
  }
};
</script>

<style lang="less">
.SetupPositions {
  .list {
    margin: 0 0 20px 0;
  }
}

.positionItemHolder {
  // when moving, this is at the Body level
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
  box-sizing: border-box; // match what SlickList uses
  white-space: nowrap;
  border-radius: 3px;
  input {
    width: 100px;
    margin: 10px 10px;
  }
  &.moving {
    text-align: center;
    background-color: lightblue;
    margin: 5px auto;
    input {
      background-color: lightblue;
    }
  }
  .num {
    display: inline-block;
    width: 20px;
    text-align: right;
    margin: 0 5px 0 0;
    font-size: 75%;
    color: grey;
  }

  label {
    display: inline-block;
    margin: 0 5px;
  }

  .moveMe {
    margin: 0 5px 0 10px;
    cursor: ns-resize;
    box-shadow: none;
  }
}
</style>
