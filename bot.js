const botSettings = require("./botsettings.json");
const discord = require("discord.js");

const fs = require("fs");
const csv = require("fast-csv");

const weather = require("weather-js");

const client = new discord.Client();
const prefix = botSettings.prefix;

client.on("ready", async () => {
	console.log("Delorean ONLINE")
	client.user.setPresence({
		game: {name: "./help", 
			url: "https://open.spotify.com/user/ubernex/playlist/1GLuALbdeHokAI3ky1YnJC?si=HcG2N7PZRamoIf2j0YwwWw",
			type: 'LISTENING' },
		status: 'online'
	});

	/*try{
		let link = await client.generateInvite(['ADMINISTRATOR']);
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
			user = client.users.get(args[0].slice(3,-1));
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
	}

	//Make it so you delete the messages if you do it manually
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
						if (parseInt(message.content) > 0 && parseInt(message.content) < 8){
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
					if (parseInt(args[0]) > 0 && parseInt(args[0]) < 8){
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
					}
				}
		});
	}

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
				weekno = 7;
				for(var i = 0; i < 5; i++){
					weekalbums += `${i + 1}. ${database[2 + i + ((weekno - 1) * 5)][0]} \n`;
				}
				message.channel.send(`Week ${weekno} Playlist:\n` + "```" + weekalbums + 
					"```\nSpotify & Download Links:\n```" + database[weekno][1] + "```");
			});
	}

	if(command === `${prefix}code`){
		message.channel.send("All bot code can be found @ https://github.com/loparcog/deloreanbot");
	}

	/*if(command === `${prefix}eval`){
		if(message.author.id != '196388136656437250') return;
		if(message.author.id == `196388136656437250`){
			message.channel.send(eval(args[0]));
		}
	}*/

	if(command === `${prefix}help`){
		message.channel.send('```ping: checks bot ping\nuserinfo <user>: gives information on given user\n' + 
			'weekly <week#>: get past weeks playlist and links to them\nthisweek: get the most recent week playlist\n' +
			'weather <location>: Find the weather of a given location\ncode: get the code to this bot!```');
	}

	if(command === `${prefix}test`){
		return;
	}
});

client.on('guildMemberAdd', member => {
	var role = member.guild.roles.find('name', 'member')
	member.addRole(role);
});

client.login(botSettings.token);