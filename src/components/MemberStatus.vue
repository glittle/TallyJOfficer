<template>
    <div class="MemberStatus">
        <div class="top">
            <div
                v-for="m in activeMembers"
                :key="m.id"
                class="member"
                :title="
                    (m.isAdmin ? 'Administrator. ' : '') +
                        (m.voting ? 'Active Voter' : 'Not Voting') +
                        (m.id === shared.me.id
                            ? 'Make my name blink on all screens'
                            : '')
                "
                :class="{
                    connected: m.connected,
                    highlight: m.highlight,
                    voting: m.voting,
                    votingOnViewer: shared.isViewer && m.voting,
                    voted: m.voted,
                    isAdmin: m.isAdmin,
                    isMe: m.id === shared.me.id,
                    participating: m.participating
                }"
                v-on:click="clicked(m)"
            >
                {{ m.name }}
            </div>

            <div
                v-for="v in activeViewers"
                :key="v.id"
                class="viewer"
                :class="{
                    connected: v.connected,
                    isMe: v.id === shared.me.id,
                    highlight: v.highlight
                }"
                v-on:click="clicked(v)"
            >
                {{ v.name }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "MemberStatus",
    data: function() {
        return {};
    },
    computed: {
        shared: function() {
            return this.$root.shared;
        },
        activeViewers: function() {
            return this.shared.viewers.filter(v => v.id);
        },
        activeMembers: function() {
            return this.shared.members.filter(m => m.name);
        }
    },
    mounted: function() {},
    methods: {
        testNow: function() {
            var vue = this;
            vue.shared.dbMe.update({
                highlight: true
            });

            setTimeout(function() {
                vue.shared.dbMe.update({
                    highlight: false
                });
            }, 2000);
        },
        clicked: function(member) {
            if (this.shared.me.id !== member.id) {
                return;
            }
            this.testNow();
        }
    }
};
</script>

<style lang="less">
.MemberStatus {
    flex-shrink: 0;
    box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.16),
        0 2px 10px 0 rgba(0, 0, 0, 0.12);

    .top {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        min-height: 2em;
        border-top: 1px solid #5d6560;
        border-bottom: 1px solid #5d6560;
        background-color: #d2d2d2;
        padding: 3px 5px;
    }

    .members,
    .viewers {
        padding: 5px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-content: center;
    }

    // .viewers {
    //   justify-content: flex-end;
    // }

    // .viewers {
    //   min-width: 80px;
    // }

    .viewer,
    .member {
        display: block;
        margin: 3px 10px;
        padding: 1px 3px;
        border-radius: 2px;
        user-select: all;
        position: relative;
        border: 2px solid transparent;

        &.connected.highlight {
            // include more selectors to take priority
            animation: pulse 0.3s infinite;
            //user-select: unset;
        }

        &.isMe {
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
            cursor: pointer;
            user-select: none;
        }
    }

    .member + .viewer {
        margin-left: 30px;
    }

    .viewer {
        margin: 0 3px;
        font-style: italic;
        padding: 0px 5px 0px 4px;
        font-size: 90%;
        align-self: center;
        background-color: #e1dfc2;

        &.connected {
            background-color: #f0eab1;
        }

        &.connected.highlight {
            animation: pulseGuest 0.3s infinite;
        }
    }

    .member {
        position: relative;
        //border: 1px dashed #9a9a9a;
        background-color: rgba(100, 100, 100, 0.1);
        border-color: #aaa;

        &.participating {
            background-color: #efc3c3; // participating, but not connected!
        }

        &.connected {
            background-color: #9fef93;
        }

        &.voting {
            background-color: #e8f4e8; // waiting for their vote
        }

        //&.votingOnViewer {
        // animation: voting 1s linear infinite;
        //}

        &.voted {
            background-color: #9fef93b0;
        }

        &.isAdmin:after {
            content: "A"; // for Admin
            position: absolute;
            bottom: -5px;
            right: -8px;
            font-size: 60%;
        }
    }

    @keyframes pulse {
        0% {
            background-color: #fff;
        }
        50% {
            background-color: #4a993e;
        }
    }
}
</style>
