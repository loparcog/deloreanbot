//Tea Discord Bot
//Giacomo Loparco | Last Edited 01/09/19

const botSettings = require("./botsettings.json");

const discord = require("discord.js");
const weather = require("weather-js");
const fs = require("fs");

//initializer for the bot
const client = new discord.Client();
const prefix = botSettings.prefix;

client.on("ready", async () => {
	uptime = new Date()
	console.log("Tea Bot ONLINE @\n" + uptime);
	client.user.setPresence({
		game: {name: "Facebook Story | ./help", 
			type: 'LISTENING' },
		status: 'online'
	});
});

client.login(botSettings.token);

client.on("message", async message => {
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

	let msg = message.content.split(" ");
	let command = msg[0];
	let args = msg.slice(1);

	if(!command.startsWith(prefix)) return;

	else if(command === `${prefix}userinfo`){
		//give user information about their account
		var user = message.author;
		if(args.length != 0){
			var userID = args[0].slice(2, -1);
			if(userID.startsWith("!")) userID = userID.slice(1);
			try{
				user = await client.fetchUser(userID);
			}
			catch (error) {
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
			.setColor("D0F0C0")
			.addField("Full Username", `${user.username}#${user.discriminator}`, true)
			.addField("User ID", user.id, true)
			.addField("Account Created", user.createdAt)
			.addField("Joined Server", joinedAt)
			.setThumbnail(user.avatarURL)
			.setTimestamp(Date.now());

		message.channel.send(embed);

		return;
	}

	else if(command === `${prefix}serverinfo`){
		var server = message.guild;
		let embed = new discord.RichEmbed()
			.setAuthor("Server Info", message.author.avatarURL)
			.setDescription(`Requested by ${message.author.username}`)
			.setColor("D0F0C0")
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

	else if(command === `${prefix}ping` || command === `${prefix}p`){
		//give response time of the bot
		message.delete(10000);
		message.channel.send(`Pong!\n${Math.floor(client.ping)}ms`)
			.then(msg => {
				msg.delete(10000);
			});
		return;
	}

	else if(command === `${prefix}prog`){
		var rawdata = fs.readFileSync('sinfo.json');
		var database = JSON.parse(rawdata);
		var roles = database[message.guild.id].roles
		let dfinal = JSON.stringify(database);
		fs.writeFileSync('sinfo.json', dfinal);
		if(args.length == 0){
			if (roles.length == 0){
				message.channel.send("No roles found!");
				console.log(message.guild.roles.array());
				// Show possible roles
			}
			else{
				// Add/Subtract a role (check for admin)
				// Type specific role to add to user
				rolestr = ""
				for (i = 0; i < roles.length; i++){
					rolestr += roles[i] + ", ";
				}
				let embed = new discord.RichEmbed()
				.setAuthor("Program Roles", message.author.avatarURL)
				.setDescription(rolestr)
				.setColor("D0F0C0")
				.setTimestamp(Date.now());

				message.channel.send(embed);
			}
		}
	}

	else if(command === `${prefix}weather` || command === `${prefix}w`){
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
				.setColor("D0F0C0")
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

	else if(command === `${prefix}help` || command === `${prefix}h`){
		//Give information on all functionalities of the bot
		let embed = new discord.RichEmbed()
			.setAuthor("Bot Commands", client.user.avatarURL)
			.setDescription(`Use the prefix ./ before all commands, all <arguments> are optional`)
			.setColor("D0F0C0")
			.addField("calendar", "get the calendar for the current month")
			.addField("weather <city>", "get the weather at a given location")
			.addField("ping", "check bot ping")
			.addField("userinfo <user>", "get information on given user" )
			.addField("serverinfo", "get information about the server")
			.setFooter("Created by Giacomo#7368");
		message.channel.send(embed);
		return;
	}

	else if(command === `${prefix}calendar` || command === `${prefix}c`){
		givenmonth = args[0];
		if(givenmonth == undefined){
			message.channel.send(currentMF());
			return;
		}
		else{
			currdate = new Date();
			givenmonth = parseInt(args[0]);
			if(!Number.isInteger(givenmonth) || 1 > givenmonth || 12 < givenmonth){
					message.channel.send("Invalid month argument!");
					return;
			}
			if(args[1] == undefined){
				message.channel.send(customMF(givenmonth, currdate.getFullYear()));
				return;
			}
			else{
				givenyear = parseInt(args[1]);
				if(!Number.isInteger(givenyear) || 1900 > givenyear || 2100 < givenyear){
					message.channel.send("Invalid year argument!");
					return;
				}
				message.channel.send(customMF(givenmonth, givenyear));
				return;
			}
		}
	}
/*
	else if(command === `${prefix}task` || command === `${prefix}t`){
		if (args.length == 0 || args[0] === 'help'){
			let embed = new discord.RichEmbed()
				.setAuthor("Task Commands", client.user.avatarURL)
				.setDescription(`All possible arguments for the ./task and ./t command\n` +
					'NOTE: You cannot start your task text with a number, but you can with quotes!')
				.setColor("D0F0C0")
				.addField("add dd mm yy <text>", "add a task to a specific date (if no year/month, next possible day)")
				.addField("get dd mm yy", "get task from a given day (or all from current month)")
				.addField("del dd mm yy", "delete a task you set for a given date")
				.addField("help", "get this page")
				.setFooter("Planner? I hardly know 'er!");
			message.channel.send(embed);
			return;
		}
		else if (args[0] === 'add'){
			if(args[1] == undefined){
				message.channel.send("Need a date and task argument! Try `./t help` to learn more");
			}
			else{
				day = Math.floor(parseInt(args[1]));
				if (!Number.isInteger(day) || day < 1 || day > 31){
					message.channel.send("Invalid day!");
					return;
				}
				if(args[2] == undefined){
					message.channel.send("Need a task argument! Try `./t help` to learn more");
					return;
				}
				else{
					if(!Number.isInteger(parseInt(args[2]))){
						// Assume it is a task
						task = args[2];
						console.log(args[2]);
						message.channel.send("Task added!");
						return;
					}
				}
			}
			return;
		}
		else if (args[0] === 'get'){
			// get a task
			return;
		}
		else if (args[0] === 'del'){
			//delete a task
			return;
		}
		else{
			message.channel.send("Invalid argument! Try `./t help` to learn more");
		}
		return;
	}
*/

	else if(command === `${prefix}init`){
		//Personal, use to track changes
		if(message.author.id == `196388136656437250`){
			var rawdata = fs.readFileSync('sinfo.json');
			var database = JSON.parse(rawdata);
			database[message.guild.id].roles = [];
			let dfinal = JSON.stringify(database);
			fs.writeFileSync('sinfo.json', dfinal);
			console.log("Initialized!")
		}
		return;
	}

	else if(command === `${prefix}rules`){
		if(message.author.id == `196388136656437250`){
			let embed = new discord.RichEmbed()
				.setAuthor("Welcome to McMaster MOOD", message.guild.iconURL)
				.setDescription("Have a good time and please,")
				.setColor("D0F0C0")
				.addField("1. BE RESPECTFUL!", 
					"This is a music discussion forum and so disagreement is to be expected, but keep it civil."+
					" If you're having a problem with a user, don't hesitate to PM one of the execs")
				.addField("2. Keep discussion relevant to the channel its in.",
					"Keeping channels nice and neat helps to keep all channels running smoothly")
				.addField("3. No NSFW content outside of #moodposting.",
					"Keep the naughties at bay")
				.addField("4. Feel free to invite anyone you think would be a good fit for the community.",
					"Non-Mac people included!")
				.addField("5. If you're new, use the `./prog <role>` command in #welcome to give yourself a faculty role so that you can post in other channels.",
					"Use `./prog` to see all possible roles")
				.addField("6. Please limit submissions of albums in #weekly-submissions to 5 per week.",
					"Weekly playlists will be picked randomly from all given albums")
				.setFooter("MOOD: Mid Ohio Open Disk-Golf");
			message.channel.send(embed)
				.then(msg => {
					msg.channel.send("https://discord.gg/FpJzvhH");
				})
		}
	}

});


function MonthFormat(day, curr){
	months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
	mon = day.getMonth();
	year = day.getFullYear(); 
	// First is 0-6, Sunday to Saturday
	/*
	An ideal calendar format would be:
	Sun  Mon  Tue  Wed  Thu  Fri  Sat
              1    2    3    4    5
    6    7    8    9    10   11   12
    13   14!  15!  16!  17   18   19
    20   21   22   23<  24   25   26
    27   28   29   30   31
	*/
	LY = false;
	if(new Date(year, 1, 29).getDate() == 29){
		LY = true;
	}
	dotw = new Date(year, mon, 1).getDay();
	nodays = 30;
	if(mon == 1){
		if(LY){
			nodays = 29;
		}
		else{
			nodays = 28;
		}
	}
	else if([0, 2, 4, 6, 7, 9, 11].includes(mon)){
		nodays = 31;
	}
	daynow = -1
	if(curr){
		daynow = day.getDate();
	}
	// TODO: Put up the month/year accessing
	cal = "```css\n>"+ months[mon] + " "+ year +"\nSun  Mon  Tue  Wed  Thu  Fri  Sat\n";
	cal += ("     ").repeat(dotw);
	var i = 1;
	while(i <= nodays){
		if (dotw == 7){
			dotw = 0;
			cal += "\n";
		}
		cal += (i);
		if (i < 10){
			if (i == daynow){
				cal += "<   "
			}
			else{
				cal += "    "
			}
		}
		else{
			if(i == daynow){
				cal += "<  "
			}
			else{
				cal += "   "
			}
		}
		dotw++;
		i++;
	}
	cal += "\n```";
	return cal;
}

function currentMF(){
	day = new Date();
	return MonthFormat(day, true);
}

function customMF(month, year){
	newmo = month - 1;
	day = new Date(year, newmo);
	return MonthFormat(day, false);
}