<template>
  <div class="Overview">
    <div
      v-if="
        shared.me.isAdmin ||
          shared.isViewer ||
          !shared.election.votingOpen
      "
      id="positionsToFill"
      class="positionsToFill panel"
    >
      <h1 v-text="$t('positions.title')"></h1>
      <div v-if="shared.enableLanguage">
        {{ $i18n.locale }}
      </div>
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Who is elected</th>
            <th>Action</th>
          </tr>
        </thead>
        <tr
          v-for="p in shared.positions"
          :key="p.name"
          class="positionHolder"
          :class="{ isActive: p.id === viewedPositionId }"
        >
          <td>{{ p.name }}</td>
          <td>
            <span v-text="nameOf(p.electedId) || '-'"></span>
          </td>
          <td class="positionBtns">
            <!-- <button
              class="primary"
              v-if="shared.me.isAdmin"
              v-on:click="select(p)"
            >Select for Voting</button>-->
            <button
              v-if="
                !shared.election.votingOpen || shared.isViewer
              "
              v-on:click="view(p)"
            >
              View
            </button>
          </td>
        </tr>
      </table>

      <p
        v-if="shared.me.isAdmin"
        class="adminBtns"
      >
        <button
          v-if="viewedPosition && !shared.election.votingOpen"
          class="primary"
          v-on:click="openVoting"
        >
          Admin: Start a round of voting for {{ viewedPosition.name }}
        </button>
        <button
          v-if="shared.election.votingOpen"
          class="caution"
          v-on:click="resetVoting"
        >
          Admin: Cancel Voting
        </button>
      </p>
    </div>

    <!-- <button v-on:click="gotoVotePanel">Cast my Vote</button> -->
    <voting-panel v-if="shared.isMember" />

    <result-panel />
  </div>
</template>

<script>
import { inject, ref, computed, watch, onMounted } from 'vue'
import ResultPanel from './ResultPanel.vue'
import VotingPanel from './VotingPanel.vue'
import firebaseDb from '../firebaseInit'

export default {
    name: 'Overview',
    components: {
        ResultPanel,
        VotingPanel
    },
    setup() {
        const shared = inject('shared')
        const viewedPosition = ref(null)

        const viewedPositionId = computed(() => {
            return (viewedPosition.value && viewedPosition.value.id) || 0
        })

        const syncToPosition = () => {
            viewedPosition.value = shared.positions.find(
                p => p.id === shared.election.positionIdToVoteFor
            )
        }

        watch(() => shared.election.positionIdToVoteFor, () => {
            syncToPosition()
        })

        onMounted(() => {
            syncToPosition()
        })

        const openVoting = () => {
            // change for everyone
            const positionIdToOpen = viewedPosition.value.id

            firebaseDb
                .ref(`/elections/${shared.electionKey}`)
                .update({ positionIdToVoteFor: '' })

            // do twice, in case we've made a local change
            firebaseDb
                .ref(`/elections/${shared.electionKey}`)
                .update({ positionIdToVoteFor: positionIdToOpen })

            // create as many slots for votes as we need, skip by a random number to be less predicable
            const participants = shared.members.filter(m => m.participating)
            const numParticipants = participants.length
            const randomSpread = 26 / numParticipants

            // prepare a list of vote slots, one for each member who is participating (doesn't matter which member for each)
            let nextLetter = 64
            const voteDict = {}
            participants.forEach((m, i) => {
                nextLetter += 1 + Math.random() * randomSpread
                voteDict[String.fromCharCode(nextLetter)] = ''
            })

            // save the vote slots
            firebaseDb.ref(`/voting/${shared.electionKey}`).set({
                positionId: positionIdToOpen,
                votes: voteDict
            })

            // turn on voting
            firebaseDb.ref(`/elections/${shared.electionKey}`).update({
                votingOpen: true
            })
        }

        const resetVoting = () => {
            // turn off voting
            shared.cancelVoting()
        }

        const view = (position) => {
            viewedPosition.value = position
            shared.election.positionIdToVoteFor = position.id
        }

        const nameOf = (id) => {
            if (!id) return ''
            const member = shared.members.find(m => m.id === id)
            if (!member) return ''
            return member.name
        }

        return {
            shared,
            viewedPosition,
            viewedPositionId,
            syncToPosition,
            openVoting,
            resetVoting,
            view,
            nameOf
        }
    }
}
</script>

<style lang="less">
.Overview {
    // max-width: 700px;
    margin: 0 auto;
    padding: 0 10px;
    .positionsToFill {
        table {
            margin: 1em auto 0;
            border-collapse: collapse;
            thead {
                border-bottom: 1px solid gray;
            }
            td {
                width: 200px;
                line-height: 2.3em;
                white-space: nowrap;
                button {
                    vertical-align: baseline;
                    margin: 0 0.8em;
                }
            }
            tr.positionHolder {
                &.isActive {
                    background-color: #9fef93;
                }
            }
        }
    }
    .reset {
        margin: 100px 0 10px 0;
    }

    .positionBtns {
        button {
            margin: 0 10px;
        }
    }
    .adminBtns {
        button {
            margin: 0 10px;
        }
    }

    .symbol {
        background-image: url("../../public/img/symbols40.png");
        width: 40px;
        height: 34px;
        margin: 3px auto;
        opacity: 0.5;
    }
}
</style>
