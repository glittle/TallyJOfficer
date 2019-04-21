<template>
  <div class="SetupPositions">
    <div class="panel">
      <h1>Define the positions to be voted for</h1>
      <p>Add, edit and move positions as required by your team.</p>
      <p>A "Sample" position is included for your team to use to practice with.</p>
      <slick-list
        class="list"
        helper-class="moving"
        lock-axis="y"
        :useDragHandle="true"
        v-on:input="listSorted"
        v-model="list"
      >
        <slick-item class="positionItemHolder" v-for="(item,i) in list" :key="item.id" :index="i">
          <span class="num">{{i+1}}</span>

          <input type="text" v-on:change="updated" v-model="item.name">

          <button class="moveMe icon" v-handle>
            <i class="material-icons">arrow_upward</i>
            <i class="material-icons">arrow_downward</i>
            <span>Move</span>
          </button>

          <button v-on:click="remove(i)" class="icon remove caution">
            <i class="material-icons">delete</i>
            <span>Delete</span>
          </button>
        </slick-item>
      </slick-list>

      <button v-on:click="add">Add Another</button>
    </div>
  </div>
</template>

<script>
import _shared from "@/shared.js";
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";
import firebaseDb from "../firebaseInit";

export default {
  name: "SetupPositions",
  components: {
    SlickList,
    SlickItem
  },
  directives: { handle: HandleDirective },
  data: function() {
    return {};
  },
  computed: {
    shared: function() {
      return _shared;
    },
    list: {
      get: function() {
        return this.shared.positions;
      },
      set: function(a) {
        this.shared.positions = a;
      }
    }
  },
  watch: {},
  mounted: function() {},
  methods: {
    // remove: function(i) {
    //   this.shared.positions.splice(i, 1);
    // },
    // add: function(i) {
    //   this.shared.positions.push(this.shared.makePosition(""));
    // },
    remove: function(i) {
      // var vue = this;
      var toRemove = this.list[i];
      firebaseDb
        .ref(`positions/${this.shared.electionKey}/${toRemove.id}`)
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
    add: function() {
      this.list.push(this.shared.makePosition("", this.list));
      this.listSorted(this.list);
    },
    listSorted: function(list) {
      list.forEach((p, i) => (p.sortOrder = i));
      this.updated();
    },
    updated: function() {
      this.list.forEach(m =>
        firebaseDb.ref(`positions/${this.shared.electionKey}/${m.id}`).set(m)
      );

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
    margin: 0 5px 0 40px;
    cursor: ns-resize;
  }
}
</style>
