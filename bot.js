//DeLorean Discord Bot
//Giacomo Loparco | Last Edited 08/09/18

//botSettings is used for the bot prefix and for the bot key/token, used to identify the bot. When using it on a local machine,
//make a botsettings.json and use that, with a token and prefix object. When using a server, use the runtime variables,
//in this case, these are set within heroku, to help hide the bot key

//const botSettings = require("./botsettings.json");

const botSettings = {
	token: process.env.token,
	prefix: process.env.prefix
}

//Imports for npm modules
const discord = require("discord.js");
const fs = require("fs");
const weather = require("weather-js");
const ytval = require("youtube-validate");
const ytdl = require("ytdl-core");

//initializer for the bot
const client = new discord.Client();
const prefix = botSettings.prefix;

var jsonchange = 0;
var randchange = 0;
var queue = {};
var streams = {};
var dispatchers = {};


client.on("ready", async () => {
	console.log("Delorean ONLINE");
	//WEEKLY CHANGE
	//"Listing to" status for the bot
	client.user.setPresence({
		game: {name: "Week 10 | ./help", 
			type: 'LISTENING' },
		status: 'online'
	});
});

//whenever a message is sent...
client.on("message", async message => {

	//...ignore if it's a bot or private message
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

	//split the message into componants
	let msg = message.content.split(" ");
	let command = msg[0];
	let args = msg.slice(1);

	//...ignore if it doesn't start with the bot prefix
	if(!command.startsWith(prefix)) return;

	// BOT COMMANDS


	//add server join date
	if(command === `${prefix}userinfo`){
		//give user information about their account
		var user = message.author;
		if(args.length != 0){
			var userID = args[0].slice(2, -1);
			if(userID.startsWith("!")) userID = userID.slice(1);
			user = getUser(userID, message);
			if(user == undefined){
				message.channel.send("User not found!")
					.then(msg => {
						msg.delete(10000);
					});
				return;
			}
		}
		var joinedAt = message.guild.members.get(user.id).joinedAt
		let embed = new discord.RichEmbed()
			.setAuthor("User Info", message.author.avatarURL)
			.setDescription(`Requested by ${message.author.username}`)
			.setColor("98FB98")
			.addField("Full Username", `${user.username}#${user.discriminator}`, true)
			.addField("User ID", user.id, true)
			.addField("Account Created", user.createdAt)
			.addField("Joined Server", joinedAt)
			.setThumbnail(user.avatarURL)
			.setTimestamp(Date.now());

		message.channel.send(embed);

		return;
	}

	if(command === `${prefix}serverinfo`){
		var server = message.guild;
		let embed = new discord.RichEmbed()
			.setAuthor("Server Info", message.author.avatarURL)
			.setDescription(`Requested by ${message.author.username}`)
			.setColor("98FB98")
			.addField("Server Name", server.name, true)
			.addField("Server ID", server.id, true)
			.addField("Owner", `${server.owner.user.username}#${server.owner.user.discriminator}`, true)
			.addField("Member Count", server.memberCount, true)
			.addField("Created on", server.createdAt, true)
			.addField("Region", server.region)
			.setThumbnail(server.iconURL)
			.setTimestamp(Date.now());

		message.channel.send(embed);
		return;
	}

	if(command === `${prefix}ping`){
		//give response time of the bot
		message.delete(10000);
		message.channel.send(`Pong!\n${Math.floor(client.ping)}ms`)
			.then(msg => {
				msg.delete(10000);
			});
		return;
	}

	if(command === `${prefix}weekly`){
			if(args.length == 0){
				//look for unhandled promise
					var messages = {}
					message.channel.send("Which week's playlist would you like to view?")
						.then(msg => {
							messages[0] = msg;
						});
					const collector = new discord.MessageCollector(message.channel, m => m.author.id === message.author.id);//, {time: 30000});
					collector.on("collect", message => {
						messages[1] = message;
						//WEEKLY CHANGE
					if (parseInt(message) > 0 && parseInt(message) < 11){
						var weekno = parseInt(message);
						var embed = getAlbumEmbed(weekno);
						message.channel.send(embed);
						collector.stop();
					}
					else{
						message.channel.send("Week not identified!")
							.then(msg => {
								msg.delete(10000);
							});
						collector.stop();
					}
					});
					collector.on("end", () => {
						for(var i = 0; i < 2; i++){
							messages[i].delete();
						}
						return;
					});
				}
				else{
					//WEEKLY CHANGE
					if (parseInt(args[0]) > 0 && parseInt(args[0]) < 11){
						var weekno = parseInt(args[0]);
						var embed = getAlbumEmbed(weekno);
						message.channel.send(embed);
					}
					else{
						message.channel.send("Week not identified!")
							.then(msg => {
								msg.delete(10000);
							});
						return;
					}
				}
	}

	if(command === `${prefix}thisweek`){
		//Give the current week playlist
		//WEEKLY CHANGE
		var embed = getAlbumEmbed(10)
		message.channel.send(embed);
		return;
	}

	if(command === `${prefix}rand` || command === `${prefix}r`){
		var rawdata = fs.readFileSync('randsong.json');
		var database = JSON.parse(rawdata);
		var len = Object.keys(database).length;
		message.channel.send(database[Math.floor(Math.random()*len)]);
		return;
	}

	if(command === `${prefix}addrand`){
		var rawdata = fs.readFileSync('randsong.json');
		var database = JSON.parse(rawdata);
		var len = Object.keys(database).length;
		if(args.length != 0){
			ytval.validateUrl(args[0])
				.then(res => {
						database[len] = `${args[0]} \nAdded by ${message.author.username}#${message.author.discriminator}`;
						let datafinal = JSON.stringify(database);
						fs.writeFileSync('randsong.json', datafinal);
						randchange++;
						console.log(`New rand song stored, change #${randchange}`);
						message.channel.send("Song added!");
						return;
				})
				.catch(er => {
					message.channel.send("URL not valid!")
						.then(msg => {
							msg.delete(10000);
						});
				});
		}
		else{
			message.channel.send("Use ./addrand <songlink> to input a song!")
				.then(msg => {
					msg.delete(10000);
				});
		}
		return;
	}

	if(command === `${prefix}weather`){
		//give the weather of a set city
		if(args.length == 0){
			var loc = "Hamilton ON";
		} 
		else{
			var loc = args.join(" ");
		}
		weather.find({search: loc, degreeType: 'C'}, (err, result) => {
			if(err) message.channel.send(err);
			if(result[0] == undefined){
				message.channel.send(`${loc} not found!`)
					.then(msg => {
						msg.delete(10000);
					});
				return;
			}
			let current = result[0].current;
			let location = result[0].location;
			let embed = new discord.RichEmbed()
				.setDescription(`**${current.skytext}**`)
				.setAuthor(`Weather for ${current.observationpoint}`)
				.setThumbnail(current.imageUrl)
				.setColor("98FB98")
				.addField('Timezone', `UTC ${location.timezone}`, true)
				.addField('Temperature (F)', `${Math.round((current.temperature * 1.8) + 32)} F`, true)
				.addField('Temperature (˚C)', `${current.temperature}˚C`, true)
				.addField('Feels Like', `${current.feelslike}˚C`, true)
				.addField('Winds', current.winddisplay, true)
				.addField('Humidity', `${current.humidity}%`, true)
				.setFooter(`Recorded @ ${current.observationtime} | ${current.date}`);
			
			message.channel.send(embed);
			return;
		});
	}

	if(command === `${prefix}help`){
		//Give information on all functionalities of the bot
		let embed = new discord.RichEmbed()
			.setAuthor("Bot Commands", client.user.avatarURL)
			.setDescription(`Use the prefix ./ before all commands, all <arguments> are optional`)
			.setColor("98FB98")
			.addField("hottake", "store the last message of a given user, more information with ./hottake help. Can also be used with ./ht")
			.addField("weekly <week#>", "get past weekly playlists and their playback links")
			.addField("thisweek", "get this weeks playlist and its playback link")
			.addField("rand", "give the user a random song")
			.addField("addrand <songlink>", "add a random song to the ./rand database (youtube links only)")
			.addField("weather <city>", "get the weather at a given location")
			.addField("suggest <msg>", "suggest a function for the bot/random song")
			.addField("ping", "check bot ping")
			.addField("userinfo <user>", "get information on given user" )
			.addField("serverinfo", "get information about the server")
			.addField("about", "bot information")
			.addField("invite", "get a link to invite this bot to your server")
			.setFooter("Created by Giacomo#7368");
		message.channel.send(embed);
		return;
	}

	if(command === `${prefix}suggest`){
		//Send a message to myself with a suggestion from the user (Gives username and server the suggestion was from)
		if(args.length == 0){
			message.channel.send("What would you like to suggest?")
				.then(msg => {
					msg.delete(10000);
				});
			const collector = new discord.MessageCollector(message.channel, m => m.author.id === message.author.id);//, {time: 30000});
			collector.on("collect", message => {
				client.users.get(`196388136656437250`).send(message.content + "\n" + 
					`${message.author.username}#${message.author.discriminator}, from ${message.guild.name}`);
				message.delete(10000);
				message.channel.send("Suggestion sent!")
					.then(msg => {
						msg.delete(10000);
					});
				collector.stop()
			});
			collector.on("end", () => {
			return;
			});
		}
		else{
			client.users.get(`196388136656437250`).send(message.content.slice(9) + "\n" + 
				`${message.author.username}#${message.author.discriminator}, from ${message.guild.name}`);	
			message.delete(10000);
			message.channel.send("Suggestion sent!")
				.then(msg => {
					msg.delete(10000);
				});
		}
		return;
	}

	if(command === `${prefix}about`){
		//Give general information about the bot
		message.channel.send("DeLorean Bot was made by Giacomo#7368 for the McMaster MOOD Club, coded in JS and " +
			"updated weekly. Its main functions are to give users weekly playlists as well as store people's quotes" +
			" and hot takes to be used to call out someone at a later time. " + 
			"For more information on the code or bot functionality, please contact myself through " +
			"./suggest or directly through DMs.");
		return;
	}

	if(command === `${prefix}code`){
		//Personal, use to track changes
		if(message.author.id == `196388136656437250`){
			//CHANGE PER UPDATE
			message.channel.send("V 1.20 (M U S I C)");
		}
		return;
	}

	if(command === `${prefix}invite`){
		//Give an invite link to invite the bot to your own server
		try{
			let link = await client.generateInvite(['ADD_REACTIONS', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 
				'EMBED_LINKS', 'CONNECT', 'SPEAK']);
			message.channel.send(`Invite me to your server @ ${link} !`);
		}
		catch(e){
			console.log(e.stack);
			message.channel.send("Error")
				.then(msg => {
					msg.delete(10000);
				});
		}
		return;
	}

	//Tommy ID: 279161746193776641
	if(command === `${prefix}getjson`){
		//Personal, get current live json
		if(message.author.id == `196388136656437250`){
			message.channel.send(new discord.Attachment('./hottake.json', 'hottake.json'));
			message.channel.send(new discord.Attachment('./randsong.json', 'randsong.json'));
			message.channel.send(`${jsonchange} addition(s) for ht`);
			message.channel.send(`${randchange} addition(s) for rs`);
		}
		return;
	}

	if((command === `${prefix}hottake`) || (command === `${prefix}ht`)){
		if(args.length == 0 || args[0] === 'help'){
			let embed = new discord.RichEmbed()
				.setAuthor("Hot Take Commands", client.user.avatarURL)
				.setDescription(`All possible arguments for the ./hottake and ./ht command`)
				.setColor("98FB98")
				.addField("<user>", "tag a user to store their last message sent as a hot take")
				.addField("help", "get this page")
				.addField("total <user>", "get the total hot takes for the server or for a given user")
				.addField("get <user> <index>", "get a specific hot take, or random if no arguments are given")
				.setFooter("Spicy, spicy hot takes");
			message.channel.send(embed);
			return;
		}
		else{
			var rawdata = fs.readFileSync('hottake.json');
			var database = JSON.parse(rawdata);
			var inbase = false;
			if(database[message.guild.id]){
				inbase = true;
			}
			if(args[0] === 'total'){
				if(inbase == false){
					message.channel.send("Server not found!")
						.then(msg => {
							msg.delete(10000);
						});
					return;
				}
				if(args.length == 1){
					var len = 0;
					for (var i in database[message.guild.id]){
						len += Object.keys(database[message.guild.id][i]).length;
					}
					message.channel.send(`This server has ${len} hot take(s)!`);
				}
				else{
					var userID = args[1].slice(2, -1);
					if(userID.startsWith("!")) userID = userID.slice(1);
					user = getUser(userID, message);
					if(user == undefined || !database[message.guild.id][userID]){
						message.channel.send("User has not hot takes or was not found")
							.then(msg => {
								msg.delete(10000);
							});
					}
					else{
						len = Object.keys(database[message.guild.id][userID]).length;
						message.channel.send(`${user.username} has ${len} hot take(s)!`);
					}
				}
			}

			//needs more error detection for ./ht @delorean and ./ht @delorean 5
			else if(args[0] === 'get'){
				if(inbase = false){
					message.channel.send("Server not found!")
						.then(msg => {
							msg.delete(10000);
						});
					return;
				}
				if (args.length == 1){
					getRandomQuote(message, database);
				}
				else if (args.length == 2){
					var userID = args[1].slice(2, -1);
					if(userID.startsWith("!")) userID = userID.slice(1);
					var user = getUser(userID, message);
					if(user == undefined || user.lastMessage == null || user.bot){
						message.channel.send("User/message not found!")
							.then(msg => {
								msg.delete(10000);
							});
						return;
					}
					var len = Object.keys(database[message.guild.id][userID]).length;
					var quoteno = Math.floor(Math.random() * len);
					let embed = new discord.RichEmbed()
						.setAuthor(`${user.username} Hot Take #${quoteno + 1}`, user.avatarURL)
						.setDescription(database[message.guild.id][userID][quoteno].quote)
						.setTimestamp(database[message.guild.id][userID][quoteno].ts)
						.setColor(`98FB98`);
					message.channel.send(embed);
					return;
				}
				else if (args.length == 3){
					var userID = args[1].slice(2, -1);
					if(userID.startsWith("!")) userID = userID.slice(1);
					var user = getUser(userID, message);
					if(user == undefined || user.lastMessage == null || user.bot){
						message.channel.send("User/message not found!")
							.then(msg => {
								msg.delete(10000);
							});
						return;
					}
					if(database[message.guild.id][userID][args[2] - 1]){
						let embed = new discord.RichEmbed()
							.setAuthor(`${user.username} Hot Take #${args[2]}`, user.avatarURL)
							.setDescription(database[message.guild.id][userID][args[2] - 1].quote)
							.setTimestamp(database[message.guild.id][userID][args[2] - 1].ts)
							.setColor(`98FB98`);
						message.channel.send(embed);
					}
					else{
						message.channel.send("Quote not found!")
							.then(msg => {
								msg.delete(10000);
							});
					}
					return;
				}
			}

			else{
				var userID = args[0].slice(2, -1);
				if(userID.startsWith("!")) userID = userID.slice(1);
				var user = getUser(userID, message);
				if(user == undefined || user.lastMessage == null){
					message.channel.send("User/message not found!")
						.then(msg => {
							msg.delete(10000);
						});
					return;
				}
				else if(user.id == message.author.id){
					message.channel.send("You can't store your own hot takes!")
						.then(msg => {
							msg.delete(10000);
						});
					return;
				}
				else if (user.bot){
					message.channel.send("Can't quote a bot!")
						.then(msg => {
							msg.delete(10000);
						});
					return;
				}
				jsonchange++;
				var lastmsg = user.lastMessage.content;
				var timestamp = new Date().toString();
				var i = 0;
				if(database[message.guild.id]){
					if(database[message.guild.id][userID]){
						var userjs = database[message.guild.id][userID]
						while(userjs[i]){
							i++;
						}
						database[message.guild.id][userID][i] = {
							'quote': lastmsg,
							'ts': timestamp
						}
					}
					else{
						database[message.guild.id][userID] = {
							'0' : {
								'quote' : lastmsg,
								'ts' : timestamp
							}
						}
					}
				}
				else{
					database[message.guild.id] = {}
					database[message.guild.id][userID] = {
						'0' : {
							'quote' : lastmsg,
							'ts' : timestamp
						}
					}
				}

				let datafinal = JSON.stringify(database);
				fs.writeFileSync('hottake.json', datafinal);
				console.log(`New hot take stored, change #${jsonchange}`);
				message.channel.send("Hot take stored!")
			}
		}
	return;
	}

	if((command === `${prefix}play`) || (command === `${prefix}p`)){
		var vc = message.member.voiceChannel;
		var id = message.guild.id;
		//add volume?

		if(args.length == 0 || args[0] === 'help'){
			let embed = new discord.RichEmbed()
				.setAuthor("Play Commands", client.user.avatarURL)
				.setDescription(`All possible arguments for the ./play and ./p command`)
				.setColor("98FB98")
				.addField("<songlink>", "send a youtube link to play it in your voice channel, or add to your queue if a song is already playing")
				.addField("help", "get this page")
				.addField("queue", "get the current song queue")
				.addField("skip", "skip the current song")
				.addField("exit", "get the bot to leave your current voice channel")
				.setFooter("PB&Jams");
			message.channel.send(embed);
			return;
		}
		if(args[0] == "queue" || args[0] == "q"){
			if(queue[id]){
				getQueue(id).then(embed => {
					message.channel.send(embed);
					return;
				});
			}
			else{
				message.channel.send("No songs in queue!")
					.then(msg => {
						msg.delete(10000);
					});
			}
		}
		if(args[0] == "exit"){
			if(vc == undefined){
				message.channel.send("Cannot find voice channel!")
					.then(msg => {
						msg.delete(10000);
					});
				return;
			}
			vc.leave();
			queue[id] = [];
			if(dispatchers[id]){
				dispatchers[id].end();
				delete streams[id];
				delete dispatchers[id];
			}
			message.channel.send("Exit successful!");
			return;
		}
		if(args[0] == "skip"){
			if(!dispatchers[id]){
				message.channel.send("No song to skip!")
					.then(msg => {
						msg.delete(10000);
					});
				return;
			}
			dispatchers[id].end();
			message.channel.send("Song skipped!");
			return;
		}
		if(vc == undefined || vc.full){
			message.channel.send("Cannot join your voice channel!")
				.then(msg => {
					msg.delete(10000);
				})
			return;
		}
		if(ytdl.validateURL(args[0])){
			if(queue[vc.guild.id] != null){
				queue[vc.guild.id].push(args[0]);
				message.channel.send("Song added to queue!");
				return;
			}
			queue[vc.guild.id] = [args[0]];
			vc.join().then(connection => {
				playSong(connection);
				});
			return;
		}
	}
});

function playSong(connection){
	var id = connection.channel.guild.id;
	const stream = ytdl(queue[id][0], { filter : 'audioonly' });
	const dispatcher = connection.playStream(stream);
	streams[id] = stream;
	dispatchers[id] = dispatcher;
	dispatcher.on("end", end => {
		queue[id].shift();
		if(queue[id].length == 0){
			connection.channel.leave();
			delete queue[id];
			return;
		}
		playSong(connection);
	});
}

function getQueue(id){
	return new Promise((resolve, reject) => {
		let embed = new discord.RichEmbed()
			.setAuthor("Song Queue", client.user.avatarURL)
			.setColor("98FB98");
		ytdl.getBasicInfo(queue[id][0])
			.then(info => {
				embed.addField(`Now Playing: ${info.title}`, `${Math.floor(info.length_seconds/60)}m ${info.length_seconds%60}s`);
				if(queue[id].length == 1){
					resolve(embed);
					return;
				}
			});
		for(var i = 1; i < queue[id].length; i++){
			ytdl.getBasicInfo(queue[id][i])
				.then(info => {
					embed.addField(info.title, `${Math.floor(info.length_seconds/60)}m ${info.length_seconds%60}s`);
					if(i == queue[id].length - 1){
						resolve(embed);
						return;
					}
			});
		}
	});
}

function getUser(id, message){
	if(message.guild.members.get(id) == undefined){
		return undefined;
	}
	else{
		return message.guild.members.get(id).user;
	}
}

function getRandomQuote(message, database){
	var len = Object.keys(database[message.guild.id]).length;
	var userobj = Math.floor(Math.random() * len);
	var i = 0;
	for(var j in database[message.guild.id]){
		if(i == userobj){
			len = Object.keys(database[message.guild.id][j]).length;
			var quoteno = Math.floor(Math.random() * len);
			var user = message.guild.members.get(j).user;
			let embed = new discord.RichEmbed()
				.setAuthor(`${user.username} Hot Take #${quoteno + 1}`, user.avatarURL)
				.setDescription(database[message.guild.id][j][quoteno].quote)
				.setTimestamp(database[message.guild.id][j][quoteno].ts)
				.setColor(`98FB98`);
			message.channel.send(embed);
			return;
		}
		else{
			i++;
		}
	}
	return;
}

function getAlbumEmbed(index){
	var rawdata = fs.readFileSync('albumdb.json');
	var albumdb = JSON.parse(rawdata);
	var weekno = index;
	var weekdata = albumdb[weekno];
	let embed = new discord.RichEmbed()
		.setAuthor(`MOOD Week ${weekno}`, client.user.avatarURL)
		.setColor(`98FB98`);
	if(weekdata.img != ""){
		embed.setThumbnail(weekdata.img);
	}
	var albums = weekdata.albums.split(" π ");
	var set = []
	for(var i = 0; i < albums.length; i++){
		set = albums[i].split(" - ");
		embed.addField(set[0],set[1]);
	}
	embed.addBlankField()
		.addField("Playback Resources", weekdata.links)
		.setDescription(`*${weekdata.date}*`)
		.setFooter(`McMaster MOOD Club 2018`)
	return(embed);
}

//Start the bot with the given token
client.login(botSettings.token);