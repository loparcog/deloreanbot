//const botSettings = require("./botsettings.json");
//Only for personal runtime
const discord = require("discord.js");

const fs = require("fs");
const csv = require("fast-csv");

const weather = require("weather-js");

const botSettings = {
	token: process.env.token,
	prefix: process.env.prefix
}

const client = new discord.Client();
const prefix = botSettings.prefix;

client.on("ready", async () => {
	console.log("Delorean ONLINE");
	//WEEKLY CHANGE
	client.user.setPresence({
		game: {name: "Week 8 | ./help", 
			type: 'LISTENING' },
		status: 'online'
	});

	//fix invite, add in about function, invite function
	/*try{
		let link = await client.generateInvite(['ADD_REACTIONS', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 
			'EMBED_LINKS', 'CONNECT', 'SPEAK']);
		console.log(`Invite: ${link}`);
	}
	catch(e){
		console.log(e.stack);
	}*/
});

client.on("message", async message => {
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

	let msg = message.content.split(" ");
	let command = msg[0];
	let args = msg.slice(1);

	if(!command.startsWith(prefix)) return;

	if(command === `${prefix}userinfo`){
		var user = message.author;
		if(args.length != 0){
			var userID = args[0].slice(2, -1);
			if(userID.startsWith("!")) userID = userID.slice(1);
			user = client.users.get(userID);
			if(user == undefined){
				message.channel.send("User not found!");
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

	if(command === `${prefix}ping`){
		message.delete(10000);
		message.channel.send(`Pong!\n${Math.floor(client.ping)}ms`)
			.then(msg => {
				msg.delete(10000);
			});
		return;
	}

	//Put message into embeded
	if(command === `${prefix}weekly`){
		//give weekly playlist
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
		if(args.length == 0){
			var loc = "Hamilton ON";
		} 
		else{
			var loc = args.join(" ");
		}
		weather.find({search: loc, degreeType: 'C'}, (err, result) => {
			if(err) message.channel.send(err);
			if(result[0] == undefined){
				message.channel.send(`${loc} not found!`);
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
		message.channel.send("Submt your songs for the weekly playlist @ https://goo.gl/forms/otK2Uq3kNVE2Yk0x2" +
			"\nMcMaster student submissions only!");
		return;
	}

	if(command === `${prefix}code`){
		if(message.author.id == `196388136656437250`){
			message.channel.send("All bot code can be found @ https://github.com/loparcog/deloreanbot");
		}
		return;
	}

	if(command === `${prefix}help`){
		message.channel.send('```~BOT COMMANDS~\nping: checks bot ping\nuserinfo <user>: gives information on given user\n' + 
			'weekly <week#>: get past weeks playlist and links to them\nthisweek: get the most recent week playlist\n' +
			'weather <location>: Find the weather of a given location\nsubmit: Submit a song for the weekly playlist\n' +
			'suggestion <msg>: suggest a function for the bot\nabout: bot information```');
		return;
	}

	if(command === `${prefix}suggestion`){
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
			});
		}
		else{
			client.users.get(`196388136656437250`).send(message.content.slice(12) + "\n" + 
				`${message.author.username}#${message.author.discriminator}, from ${message.guild.name}`);	
		}
		return;
	}

	if(command === `${prefix}about`){
		message.channel.send("DeLorean Bot was made by Giacomo#7368 for the McMaster MOOD Club, coded in JS and " +
			"updated weekly. For more information on the code or bot functionality, please contact myself through " +
			"./suggestion or directly through DMs.");
		return;
	}

	if(command === `${prefix}test`){
		return;
	}

	//RANK COMMAND (Let people add their own ranks)

	//MUSIC COMMAND (let people play music, possibly weekly playlist)
});

client.on('guildMemberAdd', member => {
	var role = member.guild.roles.find('name', 'member')
	member.addRole(role);
});

client.login(botSettings.token);