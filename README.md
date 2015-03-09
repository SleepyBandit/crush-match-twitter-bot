<!-- TITLE/ -->
# Crush Match Twitter Bot
<!-- /TITLE -->

<!-- DESCRIPTION/ -->
A twitter bot written in JavaScript on the NodeJS framework.  
This bot was designed to act as a middleman, where twitter users could send it the twitter handle of their crush and the bot would then attempt to get the user's crush to tell it who they like.
If the two users tell the bot that they have a crush on each other, then the bot will match them and announce it in a tweet.

This is the dumbed-down version of the bot to take into account the strict rate limits that twitter enforces. The full robust version may be released in the future.
<!-- /DESCRIPTION -->

<!-- MODULES/ -->
## Modules

This application utilizes the following node modules;

- [moongoosejs](http://mongoosejs.com)
- [ttezel/twit](https://github.com/ttezel/twit)

<!-- /MODULES -->
<!-- WHAT/ -->
## What else you need

To run this app you need to have;
- A local or hosted [mongoDB](http://www.mongodb.org) database
- Twitter App Credentials
- Installed the package file for dependencies (mentioned in above module section)

Place the URL to your mongoDB database in the ```database.js``` file
and your twiter App Credentials into the ```config.js``` file.
<!-- /WHAT -->

<!-- RUN/ -->
## How to start the App
Once all above steps have been followed, run the app with;
```
node server.js
```
<!-- /RUN -->

<!-- EXTRA/ -->
## Additional Information
I've included methods for adding new friends (ie following people) based on a query term and total numbers of users you wish to reach.

To run this when you first start the bot, you need to add ```bot.getFriends(T);``` to bottom of the ```server.js``` file.

This will find new users to follow based on your query parameter (like a hashtag) and continue to do so until you've reach the total number of users to follow you have configured
<!-- /EXTRA -->
