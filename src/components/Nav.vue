<template>
    <div id="nav">
        <div class="image">
            <img alt="TallyJ logo" :title="version" src="../assets/logo.png" />
        </div>
        <div v-if="$route.name !== 'createElection'" class="middle">
            <span v-if="shared.me.isAdmin">
                <router-link to="admin">Setup</router-link>
            </span>
            <span v-if="shared.me.id">
                <router-link to="share">Share</router-link>
            </span>
            <span v-if="shared.me.id">
                <router-link to="home">Voting</router-link>
            </span>
            <!-- <span v-if="shared.me.isAdmin">
        <router-link to="setupNames">Members</router-link>
      </span>
      <span v-if="shared.me.isAdmin">
        <router-link to="setupPositions">Positions</router-link>
      </span>-->
            <span>
                <router-link to="/guidance">Guidance</router-link>
            </span>
            <span>
                <router-link to="/faq">Help</router-link>
            </span>
        </div>
        <div
            class="myName"
            :class="{ isViewer: shared.isViewer }"
            :title="shared.electionKey.substring(1, 5)"
        >
            <select
                class="NavLang"
                :value="lang"
                v-on:change="setLang"
                v-if="shared.enableLanguage"
            >
                <option v-for="c in shared.languageCodes" :key="c" :value="c">
                    {{ shared.languages[c] }}
                </option>
            </select>

            <span>{{ shared.me.name }}</span>
            <button
                v-if="shared.isMember || shared.isViewer"
                v-on:click="shared.forgetMe"
            >
                Change
            </button>
        </div>
    </div>
</template>

<script>
import firebaseDb from "../firebaseInit";

export default {
    computed: {
        shared: function() {
            return this.$root.shared;
        },
        lang: function() {
            return this.shared.$i18n.locale;
        },
        version: function() {
            var lines = [
                "Version " + _version,
                "uid " +
                    (this.shared.firebaseRawAuthUser
                        ? this.shared.firebaseRawAuthUser.uid.substr(0, 3)
                        : "?"),
                "election " +
                    this.shared.electionKeyAbbrev(this.shared.electionKey),
                "id " + (this.shared.myId || "(not connected)")
            ];

            return lines.join("\n");
        }
    },
    methods: {
        setLang: function(lang) {
            this.shared.setLang(lang);
        }
    }
};
</script>

<style lang="less">
#nav {
    flex-shrink: 0;
    background: #000;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 2.5em;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
        0 2px 10px 0 rgba(0, 0, 0, 0.12);
    .NavLang {
        color: white;
        background: black;
    }
    > div {
        flex: 1 1 auto;
        white-space: nowrap;
        //display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    div.middle {
        flex-grow: 19;
        white-space: normal;
        padding: 2px 0 6px;
        span {
            margin: 0 10px;
        }
    }

    .image {
        text-align: left;
        justify-content: left;
        padding: 4px 0 0 5px;
        img {
            height: 1.5em;
        }
    }

    a {
        color: #fff;
        text-decoration: none;

        &:visited {
            color: #fff;
        }

        &:hover {
            color: #62d9a3;
        }

        &.router-link-exact-active {
            color: #42b983;
            &:hover {
                cursor: default;
                color: #42b983;
            }
        }
    }

    span {
        display: inline-block;
        margin: 3px 0.5em;
        vertical-align: middle;
    }

    button {
        font-size: 0.8em;
    }

    .myName {
        text-align: right;
        padding-right: 3px;
        color: #4a993e;
        &.isViewer {
            font-weight: bold;
        }
    }
}
</style>
