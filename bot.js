const botSettings = require("./botsettings.json");
const discord = require("discord.js");

const fs = require("fs");
const csv = require("fast-csv");

const weather = require("weather-js");

const client = new discord.Client();
const prefix = botSettings.prefix;

client.on("ready", async () => {
	console.log("Delorean ONLINE")

	try{
		let link = await client.generateInvite(['ADMINISTRATOR']);
		console.log(`Invite: ${link}`);
	}
	catch(e){
		console.log(e.stack);
	}
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
		message.channel.send(`Pong!\n${Math.floor(client.ping)}ms`);
	}

	// Rate function, needs to be edited each week
	/*if(command === `${prefix}rate`){
		var botmsg = [];
		var database = [];
		var stream = fs.createReadStream("albumdatabase.csv");
		csv
			.fromStream(stream)
			.on("data", function(data){
				database.push(data);
			})
			.on("end", function(){
				console.log("done!");
			});
		message.channel.send("Which week is the album from?\nType `quit` at anytime to stop rating")
			.then(msg => {
				botmsg.push(msg);
			});
		var weekno = -1;
		const collector = new discord.MessageCollector(message.channel, m => m.author.id === message.author.id);//, {time: 30000});
		collector.on("collect", message => {
			if (collector.collected.array().length == 1 && parseInt(message.content) > 0 && parseInt(message.content) < 8){
				weekno = parseInt(message.content);

				var weekalbums = "";
				if(weekno < 4){
					for(var i = 0; i < 5; i++){
						weekalbums += `${i + 1}. ${database[1 + i + ((weekno - 1) * 5)][0]} \n`;
					}
				}
				else if (weekno = 4){
					for(var i = 0; i < 6; i++){
						weekalbums += `${i + 1}. ${database[1 + i + ((weekno - 1) * 5)][0]} \n`;
					}
				}
				else{
					for(var i = 0; i < 5; i++){
						weekalbums += `${i + 1}. ${database[2 + i + ((weekno - 1) * 5)][0]} \n`;
					}
				}

				message.channel.send("Which album would you like to rate?\n```" + weekalbums + "\nquit. Return```")
				.then(msg => {
					botmsg.push(msg);
				});
			}
			else if (collector.collected.array().length == 2 && parseInt(message.content) > 0 && parseInt(message.content) < 7){
				if(message.content == 6 && weekno != 4){
					message.channel.send("Option not understood, returning...")
					.then(msg => {
						msg.delete(5000);
					});
					collector.stop();
					return;
				}
				if (weekno < 4){
					albumno = parseInt(message.content) + ((weekno - 1) * 5);
				}
				else if (weekno = 4){
					albumno = parseInt(message.content) + ((weekno - 1) * 5);
				}
				else{
					albumno = 1 + parseInt(message.content) + ((weekno - 1) * 5);
				}
				message.channel.send(`What is your rating of ${database[albumno][0]}?\nPlease keep to the format of ` + 
					"\n`<Number Rating from 0-5> <Word Review (Not needed)>`\n`Example: 4.5 great ear feel`")
					.then(msg => {
						botmsg.push(msg);
					});
			}
			else if(collector.collected.array().length == 3){
				message.channel.send("Processing now!")
					.then(msg => {
						botmsg.push(msg);
					});
				userIndex = -1;
				for(var i = 0; i < database[0].length; i++){
					console.log(database[0][i]);
					if(database[0][i] == message.author.id){
						userIndex = i;
						break;
					}
				}
				if(userIndex == -1){
					database[0].push(message.author.id);
					database[albumno][database[0].length - 1] = message.content;
				}
				else{
					database[albumno][userIndex] = message.content;
				}
				var streamout = fs.createWriteStream("albumdatabase.csv");
				csv
					.write(database)
					.pipe(streamout);

				message.channel.send("Review saved!")
					.then(msg => {
						msg.delete(5000);
					})
					.catch();
				collector.stop();
				return;
			}
			else if(message.content == "quit"){
				message.channel.send("Leaving ./rate...")
					.then(msg => {
						msg.delete(5000);
					});
				collector.stop();
				return;
			}
			else{
				message.channel.send("Option not understood, returning...")
					.then(msg => {
						msg.delete(5000);
					})
				collector.stop();
				return;
			}
			//collector.stop();
			//message.channel.send("Loading...");
		});
		collector.on("end", () => {
			var msgs = collector.collected.array().length;
			while(msgs > 0){
				collector.collected.array()[msgs - 1].delete();
				msgs--;
			}
			var bmsgs = botmsg.length;
			while(bmsgs > 0){
				botmsg[bmsgs - 1].delete();
				bmsgs--;
			}
			return;
		});
		//can optomize reading to only store needed rows
		//week 5 is 6 albums!

	}
	*/

	if(command === `${prefix}weekly`){
		//give weekly playlist
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

	if(command === `${prefix}eval`){
		if(message.author.id != '196388136656437250') return;
		if(message.author.id == `196388136656437250`){
			message.channel.send(eval(args[0]));
		}
	}

	if(command === `${prefix}help`){
		message.channel.send('```ping: checks bot ping\nuserinfo <user>: gives information on given user\nrate: rate albums from the weekly playlists\nweather <location>: Find the weather of a given location```');
	}

	if(command === `${prefix}test`){
		return;
	}
});

client.login(botSettings.token);