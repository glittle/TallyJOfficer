<template>
  <div class="FAQ">
    <div class="panel">
      <button class="goBack" v-on:click="goBack">Go Back</button>
      <h1>TallyJ for Officers</h1>
      <h2>Questions and Answers</h2>
      <ol>
        <li>
          <span>Is voting anonymous?</span>
          <blockquote>
            Yes. Who each person votes for is completely anonymous. While voting, all members can see which members have
            voted, but they cannot see who they voted for.
          </blockquote>
        </li>
        <li>
          <span>Is the process transparent?</span>
          <blockquote>
            Yes. During each round of voting, each voter is given a random letter privately on their own
            screen. The letters of all voters are displayed together when the results are shown.
            Once all members have submitted their vote, the results are immediately displayed to everyone.
            Each voter can verify that their vote was correctly counted and raise concerns if they see that
            it was not tallied correctly. In this way, every voter can be assured that their vote was accurately included.
          </blockquote>
        </li>
        <li>
          <span>Do all members need to be together?</span>
          <blockquote>
            No. Remote voting is one of the benefits of using TallyJ for Officers. Each member votes at their own computer / tablet / phone.
            They can be sitting in a room together, or they can be at home or any other location where they have an
            internet connection.
          </blockquote>
          <blockquote>
            If you are not all together, it is strongly recommended that everyone be connected by a conference call of some sort
            so that you can discuss the election together.
          </blockquote>
        </li>
        <li>
          <span>How much does it cost to use TallyJ for Officers?</span>
          <blockquote>It is free to use. There are no paid options or ads.</blockquote>
        </li>
        <li>
          <span>How secure is my data?</span>
          <blockquote>
            Completely secure. You provide the first names of your members and no other information.
            This is stored securely "in the cloud". When you are done with your election, you will erase it and no record of
            it will remain anywhere, not even a backup copy.
          </blockquote>
        </li>
        <li>
          <span>What technology do we need to use it?</span>
          <blockquote>
            Every voter must have their own direct access to a web browser connected to the Internet.
            This can be on an iPhone, iPad, Android phone or tablet, MacBook, Chromebook, Windows or Linux laptop or computer.
          </blockquote>
        </li>
        <li>
          <span>How do other members join the election I create?</span>
          <blockquote>
            Your election is private to you and your team. Once you, the administrator of the election, have created
            the election, you will be given a new private web address to share with the team. You need to share this with
            them in whatever way you typically share information, such as email or WhatsApp or a shared document.
            (Reading the address over the phone is not recommended because the private address is cryptic and difficult to read!)
          </blockquote>
          <blockquote>
            No passwords or login accounts are used. Everyone in your team simply accesses the same web address. When
            they connect to that web address, they will be asked to "claim" their name. If someone claims the wrong name
            they can change to claim the correct name. Your team needs to ensure that everyone is satisfied that they
            have their own name.
          </blockquote>
        </li>
        <li>
          <span>What if not all members are available to vote?</span>
          <blockquote>
            You should strive to hold your voting at a time when all members can participate. Since TallyJ for Officers
            enables remote voting, there should be no reason that all members cannot be online at the same time to vote
            together. If one or two members are not able participate at all, then you can tell the system this when you set up
            their name and it will not wait for their vote.
          </blockquote>
        </li>
        <li>
          <span>Can I display the results on a shared screen?</span>
          <blockquote>
            Yes. While each voter needs to have their own private connection to the election, you can also connect other
            computers to the election as "Viewers". This is used solely to show the results of the voting as it progresses. If one computer is being
            used by a member to submit their votes and to display results, you can use another browser or an "incognito" window
            to connect as a Viewer and display that on a screen that all can see.
          </blockquote>
        </li>
        <li>
          <span>How big can my team be?</span>
          <blockquote>
            There is no technical limit to how many members your team has, but the system was designed to support
            teams of less than twelve members. If you need to elect a group of individuals from a
            larger population, you should consider using the
            <a
              href="https://tallyj.com"
            >standard TallyJ</a>.
          </blockquote>
        </li>
        <li>
          <span>Can I let someone else be the administrator?</span>
          <blockquote>
            Yes. Whoever creates the election is automatically made to be an administrator of the election. However, you can
            make any number of other members to also be administrators. There must always be at least one administrator.
            The administrator is responsible to enter the member's names, set up the positions to be voted for, to open
            and close voting for each position, and finally, to erase the election when you are done.
          </blockquote>
        </li>
        <li>
          <span>Can the system email me the results?</span>
          <blockquote>
            No. The system does not have your email address and knows nothing about you. You are responsible to note
            who has been elected to each position. The results for each position are available to you until you
            delete the election. The election will remain in the cloud (for days or months) until you delete it.
          </blockquote>
        </li>
        <li>
          <span>How can I test the system by myself?</span>
          <blockquote>
            For initial testing, you can open a second "incognito" or "in private" tab in any computer or phone
            browser and connect into your test election using the private address. If your computer or phone has multiple types of web browsers,
            such as Chrome, Firefox, Safari and/or Edge, you can open one or two tabs in each of them to test multiple log-ins.
            To make your testing easier, you may want to create a smaller team in your test election of, say, 3 or 5 members.
          </blockquote>
          <blockquote>
            You can erase the election and make a new one as many times as you wish. When you are done testing, create
            a new election.
          </blockquote>
        </li>
        <li>
          <span>Does my team need to test it?</span>
          <blockquote>
            No. The system works well and is simple to use. To assist the team in learning how to use it, a "sample"
            position is included by default in the election. The team can practice voting with this position until
            each member feels comfortable with this method of voting.
          </blockquote>
        </li>
        <li>
          <span>How much time does it take to set up an election?</span>
          <blockquote>
            It takes a second or two to create. Then you just need to input the first names
            of the members and the positions that will be voted for. Share the election's private address with the
            rest of the team and you are ready to go!
          </blockquote>
        </li>
        <li>
          <span>What if voting isn't working?</span>
          <blockquote>
            If you start a round of voting and then add or remove members, the system may not close the Voting
            when everyone has voted. After adding or removing members, cancel that round of voting and start a new one.
          </blockquote>
        </li>
        <li>
          <span>What if the system just doesn't work?</span>
          <blockquote>
            First refresh your browser (press F5). If that doesn't fix the problem and
            you are unable to use TallyJ for Officers, you can revert to whatever
            method of collecting and counting ballots you would have used previously.
          </blockquote>
        </li>
        <li>
          <span>Who made TallyJ for Officers?</span>
          <blockquote>
            The system was created by Glen Little. The final version was modified and improved from feedback
            received by early beta testers and by people like you! If you have suggestions for how to make it better,
            please feel free to send them to Glen by email at <a href="mailto:glen.little@gmail.com">glen.little@gmail.com</a>.
          </blockquote>
          <blockquote>If you have another question that has not been answered here, please send Glen an email!</blockquote>
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
import _shared from "@/shared.js";

export default {
  name: "FAQ",
  data: function() {
    return {};
  },
  computed: {
    shared: function() {
      return _shared;
    },
    version: function() {
      return _version;
    }
  },
  watch: {},
  methods: {
    goBack: function() {
      history.go(-1); // not sure why -1 doesn't work
    }
  }
};
</script>

<style lang="less">
.FAQ {
  li {
    > span {
      font-weight: bold;
    }
  }
  button {
    font-family: "Acme", sans-serif;
  }
  .goBack {
    float: right;
  }
}
</style>
