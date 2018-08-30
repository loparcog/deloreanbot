# Delorean Bot
Utility bot for discord chat service written in javascript. The basis for
this bot is for providing up-to-date information on the weekly and past
weekly playlists from the McMaster MOOD club, storing quotes and hot takes
fellow users might say to store for a later date, and other miscellaneous
functions such as weather of any city around the world, user, and server
information. This bot is updated weekly to add the new playlist to the given
JSON database, and to update the bot functions pertaining to the weekly playlists.

# Using this Bot Code
This bot code can be quickly cloned and modified for personal use,
along with some personal work to get some files not in the repository due to
the .gitignore. This bot uses nodejs and npm. You will need to initialize your
directory with the bot code in it using npm init, and then further install the
discord.js package, and weather-js package if you would like to keep the weather functionality.
A file titled botsettings.json would also be needed, holding your bot's token, which can be found
at https://discordapp.com/developers/applications/, and whatever prefix you would like your bot to
have, which will differentiate regular chat messages from messages the bot will read and
process as a command. The procfile and environment variables found in the code are only
needed for hosting on heroku, in which everything stored in the botsettings.json file are
kept as local variables, to make them less accessable to the public and make sure that
my bot token is safe while still being able to share this code.

# Note
All code was created by myself, except npm-made (package.json, package-lock.json) and any
npm modules used in this project.
