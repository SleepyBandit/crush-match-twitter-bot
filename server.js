var Twit = require('twit');
var mongoose = require('mongoose');
var config = require('./config.js');
var configDB = require('./database.js');
var Crush = require('./schema.js');
var bot = require('./bot.js');

var T = new Twit(config.appKeys);

// connect to our database
mongoose.connect(configDB.url);

// read a direct stream
var stream = T.stream('user');

stream.on('direct_message', function (msg) {
    var message = msg.direct_message.text;
    var user = msg.direct_message.sender.screen_name;
    var userIdNum = msg.direct_message.sender.id_str;
    var res = config.responses;
    var crushResult;

    if (user != 'Crush_Match') {
        console.log('****** New DM ****** '+ user + ' : ' + message);
        var result = bot.dmTest(message);
        switch (result) {
            case 'crush':
                crushResult = bot.parseCrush(message);
                if ( (crushResult === 'none found') || (/\bcrush_match\b/gi.test(crushResult)) || (/\busername\b/gi.test(crushResult)) || (crushResult.substr(1).toLowerCase() === user.toLowerCase()) ){
                    console.log("Do not pass go.");
                } else {
                    // See if db already contains user info
                    bot.checkDatabase({ 'userId' : userIdNum}, function(dbResult){
                        if (dbResult == false) { // no db entry found for current user
                            // check that user's crush isn't already in system and matched
                            bot.checkDatabase({ 'user' : crushResult.substr(1).toLowerCase()}, function(dbExistingMatchResult){
                                // if crush is already a user in db and is already matched
                                if((dbExistingMatchResult != false) && (dbExistingMatchResult.matched == true)) {
                                    // let user know they have to pick another crush
                                    bot.sendDirectMsg(user, res.userAlreadyMatched, T);
                                    console.log(user+"'s crush is already matched");
                                } else { // if crush is not a user or not matched
                                    // create new entry in db for current user
                                    bot.createNewCrush(user.toLowerCase(), userIdNum, crushResult.substr(1).toLowerCase(), function (createResult) {
                                        if (createResult == true) { // confirm db entry was created
                                            // if crush exists in system and crushes user too
                                            if((dbExistingMatchResult != false) && (dbExistingMatchResult.crush === user.toLowerCase())) {
                                                // update both db records
                                                bot.updateDbItem(userIdNum);
                                                bot.updateDbItem(dbExistingMatchResult.userId);
                                                // Post status update
                                                var randEnd = res.matchTagLine[Math.floor(Math.random() * res.matchTagLine.length)];
                                                bot.postToCrush('@'+dbExistingMatchResult.user+ ' and @' +user+ ' are a crush match! '+randEnd, T);
                                            } else {
                                                if (dbExistingMatchResult != false){
                                                    console.log('user is in db, just does not like user');
                                                }
                                                // crush is not in system or does not like user
                                                bot.sendDirectMsg(user, res.crush, T);
                                                bot.postToCrush(crushResult+res.statusPost, T);
                                            }
                                            //TODO - Run check prior to sending directed tweet
                                            //check if api timer has started
                                            if (!bot.apiTimerStarted) {
                                                console.log('start api timer...');
                                                bot.apiTimerStarted = true;
                                                bot.apiSetInt = setInterval(function(){
                                                    bot.checkDbAndUpdate(T);
                                                    }, 5100);
                                            }
                                        } else {
                                            console.log('Error occurred during db creation.');
                                        }
                                    }); //end createNewCrush
                                }
                            }); //end check database
                        } else { // user already in db
                            if (dbResult.matched == true) { // user is matched already
                                // user has been matched already
                                bot.sendDirectMsg(user, res.alreadyMatched, T);
                                console.log('user already matched');
                            } else { // user has not been matched
                                // check if user's crush is in db as user
                                bot.checkDatabase({ 'user' : dbResult.crush}, function(dbCrushResult) {
                                    if(dbCrushResult != false) { //crush exists as user in db
                                        if(dbCrushResult.crush === user.toLowerCase()) {
                                            // crush likes user!
                                            // update both db records
                                            bot.updateDbItem(userIdNum);
                                            bot.updateDbItem(dbCrushResult.userId);
                                            // Post status update
                                            var randEnd = res.matchTagLine[Math.floor(Math.random() * res.matchTagLine.length)];
                                            bot.postToCrush('@'+dbCrushResult.user+ ' and @' +user+ ' are a crush match! '+randEnd, T);

                                        } else if (dbCrushResult.matched == true) {
                                            // crush is in system and is already matched with someone else
                                            // delete user from db
                                            dbResult.remove( function(err){
                                                if (err) {
                                                    console.log(err);
                                                }
                                            });
                                            // inform user they are matched with someone else
                                            bot.sendDirectMsg(user, res.badNews, T);
                                        }
                                    } else { // crush does not exist as user in db
                                        console.log(user+"'s crush is not in db as a user yet.");
                                    }
                                });
                            }
                        }
                    }); // end checkDatabase
                }
                break;
            case 'dnu':
                console.log(user+" sent msg that could not be understood");
                break;
            default:
                console.log("No idea how the code was able to trigger this...");
                break;
        }
    }
});


stream.on('follow', function (eventMsg) {
    var user = eventMsg.source.screen_name;
    var res = config.responses;
    if (user != 'Crush_Match') {
        console.log('****** New Follower! ' + user + ' ******');
        bot.addFriendAndGreet(user, res, T);
    }
});