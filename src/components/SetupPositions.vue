<template>
  <div class="SetupPositions">
    <p>Defined the positions to be voted for.</p>
    <p>Add, edit and move positions as desired.</p>
    <slick-list
      class="list"
      helper-class="moving"
      lock-axis="y"
      v-on:input="listSorted"
      v-model="list"
    >
      <slick-item class="positionItemHolder" v-for="(item,i) in list" :key="item.id" :index="i">
        <span class="num">{{i+1}}</span>
        
        <input type="text" v-on:change="updated" v-model="item.name">
        
        <button class="remove" v-on:click="remove(i)">Remove</button>
        
        <span class="moveMe">Move ↕</span>
      </slick-item>
    </slick-list>

    <button v-on:click="add">Add Another</button>
  </div>
</template>

<script>
import _shared from "@/shared.js";
import { SlickList, SlickItem } from "vue-slicksort";
import firebaseDb from "../firebaseInit";

export default {
  name: "SetupPositions",
  components: {
    SlickList,
    SlickItem
  },
  data: function() {
    return {
      list: []
    };
  },
  computed: {
    shared: function() {
      return _shared;
    }
  },
  watch: {},
  mounted: function() {
    this.list = this.shared.positions;
  },
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
  padding: 5px 0;
  box-sizing: border-box; // match what SlickList uses
  white-space: nowrap;
  border-radius: 3px;

  &.moving {
    background-color: lightblue;
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
  .remove {
    margin: 0 5px;
  }

  .moveMe {
    display: inline-block;
    margin: 0 5px 0 20px;
    font-size: 85%;
    background-color: lighten(lightblue, 2%);
    padding: 2px 6px;
    border-radius: 3px;
    cursor: ns-resize;
  }
}
</style>
