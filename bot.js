//DeLorean Discord Bot
//Giacomo Loparco | Last Edited 27/08/18

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
const csv = require("fast-csv");

const weather = require("weather-js");

//initializer for the bot
const client = new discord.Client();
const prefix = botSettings.prefix;


client.on("ready", async () => {
	console.log("Delorean ONLINE");
	//WEEKLY CHANGE
	//"Listing to" status for the bot
	client.user.setPresence({
		game: {name: "Week 8 | ./help", 
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

	if(command === `${prefix}userinfo`){
		//give user information about their account
		var user = message.author;
		if(args.length != 0){
			var userID = args[0].slice(2, -1);
			if(userID.startsWith("!")) userID = userID.slice(1);
			user = client.users.get(userID);
			if(user == undefined){
				message.channel.send("User not found!")
					.then(msg => {
						msg.delete(10000);
					});
				return;
			}
		}
		let embed = new discord.RichEmbed()
			.setAuthor("User Info", message.author.avatarURL)
			.setDescription(`Requested by ${message.author.username}`)
			.setColor("F7D0F7")
			.addField("Full Username", `${user.username}#${user.discriminator}`, true)
			.addField("User ID", user.id, true)
			.addField("Account Creation", user.createdAt)
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
			.setColor("F7D0F7")
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
		//give weekly playlist chosen by user
		var database = [];
		var stream = fs.createReadStream("albumdatabase.csv");
		csv
			.fromStream(stream)
			.on("data", function(data){
				database.push(data);
			})
			.on("end", function(){
				var weekno = -1;
				if(args.length == 0){
					var messages = {}
					message.channel.send("Which week's playlist would you like to view?")
						.then(msg => {
							messages[0] = msg;
						});
					const collector = new discord.MessageCollector(message.channel, m => m.author.id === message.author.id);//, {time: 30000});
					collector.on("collect", message => {
						messages[1] = message;
						//WEEKLY CHANGE
						if (parseInt(message.content) > 0 && parseInt(message.content) < 9){
							weekno = parseInt(message.content);
								var weekalbums = "";
							if(weekno < 4){
								for(var i = 0; i < 5; i++){
									weekalbums += `${i + 1}. ${database[1 + i + ((weekno - 1) * 5)][0]} \n`;
								}
							}
							else if (weekno == 4){
								for(var i = 0; i < 6; i++){
									weekalbums += `${i + 1}. ${database[1 + i + ((weekno - 1) * 5)][0]} \n`;
								}
							}
							else{
								for(var i = 0; i < 5; i++){
									weekalbums += `${i + 1}. ${database[2 + i + ((weekno - 1) * 5)][0]} \n`;
								}
							}
							message.channel.send(`Week ${weekno} Playlist:\n` + "```" + weekalbums + 
								"```\nSpotify & Download Links:\n```" + database[weekno][1] + "```");
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
					if (parseInt(args[0]) > 0 && parseInt(args[0]) < 9){
						weekno = parseInt(args[0]);
						var weekalbums = "";
						if(weekno < 4){
							for(var i = 0; i < 5; i++){
								weekalbums += `${i + 1}. ${database[1 + i + ((weekno - 1) * 5)][0]} \n`;
							}
						}
						else if (weekno == 4){
							for(var i = 0; i < 6; i++){
								weekalbums += `${i + 1}. ${database[1 + i + ((weekno - 1) * 5)][0]} \n`;
							}
						}
						else{
							for(var i = 0; i < 5; i++){
								weekalbums += `${i + 1}. ${database[2 + i + ((weekno - 1) * 5)][0]} \n`;
							}
						}
						message.channel.send(`Week ${weekno} Playlist:\n` + "```" + weekalbums + 
							"```\nSpotify & Download Links:\n```" + database[weekno][1] + "```");
					}
					else{
						message.channel.send("Week not identified!")
							.then(msg => {
								msg.delete(10000);
							});
						return;
					}
				}
		});
	}

	//make option to change degrees
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
				.setColor("FFD700")
				.addField('Timezone', `UTC ${location.timezone}`, true)
				.addField('Degree Type', `˚C`, true)
				.addField('Temperature', `${current.temperature}˚C`, true)
				.addField('Feels Like', `${current.feelslike}˚C`, true)
				.addField('Winds', current.winddisplay, true)
				.addField('Humidity', `${current.humidity}%`, true)
				.setFooter(`Recorded @ ${current.observationtime} | ${current.date}`);
			
			message.channel.send(embed);
			return;
		});
	}

	if(command === `${prefix}thisweek`){
		//Give the current week playlist
		var database = [];
		var weekalbums = "";
		var stream = fs.createReadStream("albumdatabase.csv");
		csv
			.fromStream(stream)
			.on("data", function(data){
				database.push(data);
			})
			.on("end", function(){
				//WEEKLY CHANGE
				weekno = 8;
				for(var i = 0; i < 5; i++){
					weekalbums += `${i + 1}. ${database[2 + i + ((weekno - 1) * 5)][0]} \n`;
				}
				message.channel.send(`Week ${weekno} Playlist:\n` + "```" + weekalbums + 
					"```\nSpotify & Download Links:\n```" + database[weekno][1] + "```");
			});
		return;
	}

	//may take out for public?
	if(command === `${prefix}submit`){
		//give the link to submit album suggestions for the next weekly playlist
		message.channel.send("Submt your albums for the weekly playlist @ https://goo.gl/forms/otK2Uq3kNVE2Yk0x2" +
			"\nMcMaster student submissions only!");
		return;
	}

	if(command === `${prefix}code`){
		//Personal, use to track changes
		if(message.author.id == `196388136656437250`){
			//CHANGE PER UPDATE
			message.channel.send("V 1.06 (JSON hottake partial)");
		}
		return;
	}

	if(command === `${prefix}help`){
		//Give information on all functionalities of the bot
		let embed = new discord.RichEmbed()
			.setAuthor("Bot Commands", client.user.avatarURL)
			.setDescription(`Use the prefix ./ before all commands, all <arguments> are optional`)
			.setColor("98FB98")
			.addField("hottake", "store a quote of a given user, more information with ./hottake help")
			.addField("weekly <week#>", "get past weekly playlists and their playback links")
			.addField("thisweek", "get this weeks playlist and its playback link")
			.addField("submit", "get the link to submit a song to the weekly playlist")
			.addField("weather <city>", "get the weather at a given location")
			.addField("suggestion <msg>", "suggest a function for the bot")
			.addField("ping", "check bot ping")
			.addField("userinfo <user>", "get information on given user" )
			.addField("serverinfo", "get information about the server")
			.addField("about", "bot information")
			.addField("invite", "get a link to invite this bot to your server")
			.setFooter("Created by Giacomo#7368");
		message.channel.send(embed);
		return;
	}

	if(command === `${prefix}suggestion`){
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
			client.users.get(`196388136656437250`).send(message.content.slice(12) + "\n" + 
				`${message.author.username}#${message.author.discriminator}, from ${message.guild.name}`);	
		}
		return;
	}

	if(command === `${prefix}about`){
		//Give general information about the bot
		message.channel.send("DeLorean Bot was made by Giacomo#7368 for the McMaster MOOD Club, coded in JS and " +
			"updated weekly. Its main functions are to give users weekly playlists as well as store people's quotes" +
			" and hot takes to be used to call out someone at a later time. " + 
			"For more information on the code or bot functionality, please contact myself through " +
			"./suggestion or directly through DMs.");
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
		}
		return;
	}

	if(command === `${prefix}htt`){
		if(args.length == 0 || args[0] === 'help'){
			let embed = new discord.RichEmbed()
				.setAuthor("Hot Take Help", client.user.avatarURL)
				.setDescription(`All possible arguments for the ./hottake command`)
				.setColor("98FB98")
				.addField("<user>", "tag a user to store their hot take")
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
					user = client.users.get(userID);
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

			else if(args[0] === 'get'){
				message.channel.send("Under construction");
			}

			else{
				var userID = args[0].slice(2, -1);
				if(userID.startsWith("!")) userID = userID.slice(1);
				var user = client.users.get(userID);
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
				var q = user.lastMessage;
				var timestamp = new Date().toString()
				if(database[message.guild.id]){
					if(database[message.guild.id][userID]){
						var i = 0;
						var userjs = database[message.guild.id][userID]
						while(userjs[i]){
							i++;
						}
						database[message.guild.id][userID][i] = {
							quote: q,
							ts: timestamp
						}
					}
					else{
						database[message.guild.id][userID] = {
							0 : {
								quote : q,
								ts : timestamp
							}
						}
					}
				}
				else{
					database[message.guild.id] = {
						userID : {
							0 : {
								quote : q,
								ts : timestamp
							}
						}
					}
				}

				let datafinal = JSON.stringify(database);
				fs.writeFileSync('hottake.json', datafinal);
				message.channel.send("Hot take stored!")
					.then(msg => {
						msg.delete(10000);
					});
			}
		}
	return;
	}

});

function getRandomQuote(server, database){

}

//Start the bot with the given token
client.login(botSettings.token);