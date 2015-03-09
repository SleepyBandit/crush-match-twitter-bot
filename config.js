module.exports = {

    friends: 900, // number of friends to reach

    query: '#WhyImSingle', // what to search for new friends by

    count: 50, // count of number of returned users\

    responses : {
        greet: "Tell me ur crush by DMing 'my crush is @username'. I'll anonymously tell them sum1 likes them. If they tell me they like u, i'll match u up!",

        crush : "Thanks for telling me your crush! I'll tell them someone has a crush on them, and if they tell me they like you, then I'll let you know!",

        badNews : "Ouch. I've got bad news, your crush has been matched with someone else. Sorry! DM me a new crush by saying 'my crush is @username'",

        matchTagLine : ['Woohoo!', 'Congrats you two!', 'Wowzers!', 'Awesomesauce!', 'Keep it PG now you two ;)', 'Time for awkward texting!', "Dinomite!", "Do I hear wedding bells?", "About time you two knew!", "It was love at first bot crush match <3"],

        alreadyMatched: "You've already been matched with your crush. What more could you want? If you're unhappy, take it up with them. I've done my job.",

        userAlreadyMatched: "Sorry! Looks like I already matched your crush with someone else. Let me know if u have another crush.",

        notAUser: "I checked and your crush does not exist on twitter. You'll have to try again. DM me, 'my crush is @username', ensure the username is right.",

        statusPost : " someone has told me they have a crush on you! follow and DM me to learn how you can find out who your crush is :)"
    },
    // twitter app keys
    appKeys : {
        consumer_key:         '{INSERT CONSUMER KEY}',
        consumer_secret:      '{INSERT CONSUMER SECRET}',
        access_token:         '{INSERT ACCESS TOKEN}',
        access_token_secret:  '{INSERT TOKEN SECRET}'
    }
};