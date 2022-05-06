<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
    computed: {
        shared: function() {
            return this.$root.shared;
        }
    },
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
    color: #1c2025;
    margin: 0;
    height: 100%;
    background-color: #e9ebee;
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
    //border: none;
    //border-bottom: solid 1px lightgray;
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
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
        0 2px 10px 0 rgba(0, 0, 0, 0.12);
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
    font-size: 0.9rem;
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

        &:hover,
        &:active,
        &:focus,
        &:visited {
            text-decoration: none;
            color: #111;
        }
    }
    &.caution {
        background-color: #993e4a;
        // font-size: 0.8em;
    }
    &.notUsual {
        background-color: #d2691e;
    }
    &.warning {
        background-color: #cf9236;
        // font-size: 0.8em;
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
        // opacity: 0.6;
        background-color: #89bf82;
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
        padding: 0 10px 2px 5px;
        min-width: 40px;
        margin: 0;
        color: #5d975e;
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
        &.notUsual {
            color: burlywood;
            font-size: 0.9em;
        }
    }
}

// .el-popconfirm {
//   font-size: 1.2em;
//   .el-button--mini {
//     font-size: 0.9em;
//     padding: 5px 10px;
//   }
// }

// .el-button {
//   padding: 2px 6px 2px 4px;
//   font-size: 1rem;
//   vertical-align: middle;

//   [class*=" el-icon-"],
//   [class^="el-icon-"] {
//     font-size: 1.4em;
//     vertical-align: bottom;
//   }
//   [class*="el-icon-"] + span {
//     margin-left: 5px;
//     vertical-align: text-top;
//   }

//   &.is-circle {
//     padding: 5px;
//   }
// }
// .el-input {
//   font-size: 1em;
// }
// .el-button--success {
//   color: #fff;
//   background-color: #4a993e;
//   border-color: #4a993e;
// }
// .el-dialog__body {
//   word-break: normal;
//   padding: 0 25px 100px;
//   #body {
//     outline: none;
//   }
// }
// .el-dialog__wrapper {
//   top: 1vh;
//   bottom: 1vh;
//   left: 1vw;
//   right: 1vw;
// }

// .el-popover {
//   box-shadow: 0 2px 12px 1px rgba(0, 0, 0, 1);
// }
</style>
