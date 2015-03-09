var config = require('./config.js');
var Crush = require('./schema.js');

var bot = {
    currentFriends: [],
    potentialFriends: [],
    apiSetInt: null,
    apiTimerStarted: false
};

// Get new friends
bot.getFriends = function(T) {
    T.get('friends/ids', function (err, data, response) {
        if (err) {
            console.log(err);
        } else {
            bot.currentFriends = data.ids;
            if (bot.currentFriends.length < config.friends) {
                bot.findPosters(T);
            } else {
                console.log('Reached ' + bot.currentFriends.length + ' friends!');
            }
        }
    });
};

// Find tweets and their poster based on query
bot.findPosters = function(T) {
    T.get('search/tweets',{ q: config.query, count: config.count }, function(err, data, response) {
        if (err) {
            console.log(err);
        } else {
            for (i = 0; i < data.statuses.length; i++) {
                var pf = {
                    user: data.statuses[i].user.screen_name,
                    id: data.statuses[i].user.id_str
                };
                bot.potentialFriends.push(pf);
            }
            bot.checkThenAdd(T);
        }
    });
};

// Check if potential friend is already a friend
bot.checkThenAdd = function(T) {
    var checkFriend;
    var cfId;
    var cfUser;
    if(!bot.potentialFriends.length) {
        console.log('no more people to try and friend...');
        bot.getFriends(T);
    } else {
        checkFriend = bot.potentialFriends.shift();
        cfId = checkFriend.id;
        cfUser = checkFriend.user;
        if (bot.currentFriends.indexOf(cfId) > -1) {
            console.log(checkFriend.user + " is already Crush_Match's friend");
            bot.checkThenAdd(T);
        } else {
            T.post('friendships/create', {screen_name: cfUser}, function (err, data, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(cfUser+' added as a new friend.');
                }
            });
            setTimeout(function() {
                bot.checkThenAdd(T);
            }, 60000);
        }
    }
};

// Determine what DM is saying
bot.dmTest = function(msg) {
    var crush = /\bcrush\b/gi.test(msg);
    var dumbuser = msg.match(/\@([a-zA-Z0-9-_]+)/ig);
    if ( (crush) || (dumbuser != null) ){
        return 'crush';
    } else {
        return 'dnu';
    }
};

// Parse crush from DM
bot.parseCrush = function(msg) {
    var crushUser;
    var crush = msg.match(/\@([a-zA-Z0-9-_]+)/ig);
    if (crush != null) {
        crushUser = crush[0];
    } else {
        crushUser = 'none found';
    }
    return crushUser;
};

// Send DM to user
bot.sendDirectMsg = function(user, msg, T) {
    T.post('direct_messages/new', {
        screen_name: user,
        text: msg
    }, function (err, data, response) {
        if (err){
            console.log(err);
        }
    });
};

// Check DB for value
bot.checkDatabase = function(value, callback) {
    Crush.findOne(value, function(err, result) {
        if (err) {
            console.log(err);
            callback(false);
        }
        if (result) {
            callback(result);
        } else {
            callback(false);
        }
    });
};

// Update DB entry
bot.updateDbItem = function(userIdNum) {
    Crush.update({ userId: userIdNum }, { $set: { matched: true }}, function( err, result ) {
        if (err) {
            console.log(err);
        }
    });
};

// Create new DB entry
bot.createNewCrush = function(username, userIdNum, crushResult, callback) {
    // Create DB entry
    var newCrush = new Crush({
        user : username,
        userId: userIdNum,
        crush:  crushResult,
        matched: false
    });
    // Save to DB
    newCrush.save(function (err, data) {
        if (err) {
            console.log(err);
            callback(false);
        }
        else {
            callback(true);
        }
    });
};

// Check twitter for Crush and their UserID
// Rate limit - 180 per 15 minutes - 12 a minute - 1 every 5 seconds
bot.checkTwitterForCrush = function(crushResult, T, callback) {
    T.get('users/lookup',{screen_name: crushResult }, function(err, data, response) {
        if (err) {
            console.log(err);
            callback(false);
        } else {
            callback(data[0].id_str);
        }
    });
};

// Add new friend and send greeting
bot.addFriendAndGreet = function(user, res, T) {
    T.post('friendships/create', {screen_name: user}, function (err, data, response) {
        if (err) {
            console.log(err);
        } else {
            bot.sendDirectMsg(user, res.greet, T);
        }
    });
};

// Post status to crush
bot.postToCrush = function(status, T) {
    T.post('statuses/update', { status: status }, function(err, data, response) {
        if (err) {
            console.log(err);
            return false;
        } else {
            return true;
        }
    });
};

// Rate limit - 180 per 15 minutes - 12 a minute - 1 every 5 seconds
bot.checkDbAndUpdate = function(T) {
    var responses = config.responses;
    Crush.findOne( { crushId : { $exists : false } }, function(err, result) {
        if (err) {
            console.log(err);
        }
        if (result) {
            bot.checkTwitterForCrush(result.crush, T, function(res){
                if (res != false) { // if not false, update db entry of user to add crush ID
                    console.log('crush ID = '+res);
                    bot.updateDbCrushId(result.userId, res);
                } else { // if false, notify user and delete their entry
                    console.log('No crush exist on twitter! Notify user and delete db entry');
                    bot.sendDirectMsg(result.user, responses.notAUser, T);
                    result.remove( function(err){
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        } else {
            console.log('no users left without crushId in DB. turn off timer');
            clearInterval(bot.apiSetInt); // turn off timer
            bot.apiTimerStarted = false;
        }
    });
};

// Update DB entry to add CrushId
bot.updateDbCrushId = function(userIdNum, crushIdNum) {
    Crush.update({ userId: userIdNum }, { $set: { crushId: crushIdNum }}, function( err, result ) {
        if (err) {
            console.log(err);
        }
    });
};

module.exports = bot;