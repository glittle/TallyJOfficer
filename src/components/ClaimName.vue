<template>
    <div class="ClaimName">
        <div class="panel">
            <p>{{ $t("Welcome1") }}</p>
            <div v-if="shared.enableLanguage">
                <p>{{ $t("SelectLanguage") }}</p>
                <button
                    class="lang"
                    v-for="c in shared.languageCodes"
                    :key="c"
                    :class="{ active: $i18n.locale === c }"
                    v-on:click="shared.setLang(c)"
                >
                    {{ shared.languages[c] }}
                </button>
            </div>

            <p>Please claim your name...</p>
            <table>
                <tbody>
                    <tr
                        v-for="m in shared.members"
                        :key="m.id"
                        class="memberHolder"
                        :class="{ claimed: m.connected }"
                    >
                        <th>{{ m.name }}</th>
                        <td>
                            <button
                                v-if="m.participating && !m.connected"
                                v-on:click="claim(m)"
                            >
                                This is me!
                            </button>
                            <span v-if="m.connected">Claimed</span>
                            <span v-if="!m.participating">Not Voting</span>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr
                        v-for="m in shared.viewers"
                        :key="m.id"
                        class="memberHolder"
                        :class="{ claimed: m.connected }"
                    >
                        <th>{{ m.name }}</th>
                        <td>
                            <button
                                v-if="!m.connected"
                                v-on:click="claimViewer(m)"
                            >
                                Join as Viewer
                            </button>
                            <span v-if="m.connected">Claimed</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <!-- <div class="panel">
            <p>
                Or, if this browser will be used to display results, click
                <button v-on:click="claimViewer">Viewer</button>
            </p>
            <p>
                To use this computer as a voter <strong>and</strong> as a
                viewer, use an "In Private"/"Incognito" window for one of the
                sessions!
            </p>
        </div> -->
        <div v-if="!shared.me.id" class="panel">
            <p>
                To entirely leave this election, click
                <button class="caution" v-on:click="logout">
                    Leave this Election
                </button>
            </p>
            <p>An administrator can delete the election on the Setup page.</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "ClaimName",
    data: function() {
        return {};
    },
    computed: {
        shared: function() {
            return this.$root.shared;
        }
    },
    updated: function() {
        if (this.shared.me.id) {
            // can't look here if already claimed?
            this.$router.replace("/e");
        }
    },
    methods: {
        claim: function(member) {
            if (member.connected) {
                // already claimed!
                return;
            }

            this.shared.claimMember(member.id);

            this.$router.replace("/e");
        },
        logout: function() {
            this.shared.logout();
            this.$router.replace("/");
        },
        claimViewer: function(member) {
            if (member.connected) {
                // already claimed!
                return;
            }

            this.shared.claimViewer(member.id);

            this.$router.replace("/e");
        }
    }
};
</script>

<style lang="less">
.ClaimName {
    max-width: 700px;
    margin: 0 auto;
    padding: 0 10px;

    table {
        margin: 1em auto;
        border-collapse: collapse;
        th {
            font-weight: normal;
            padding-right: 40px;
        }
    }

    td,
    th {
        padding: 0 1em;
    }

    tfoot {
        background-color: #e9e9e9;
        tr:first-child {
            border-top: 3px double grey;
        }
    }
    tr.memberHolder {
        height: 3em;
        cursor: pointer;
    }
    button {
        &.lang {
        }
        &.active {
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.5) inset;
        }
    }
}
</style>
