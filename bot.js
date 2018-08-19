const botSettings = require("./botsettings.json");
const discord = require("discord.js");
const fs = require("fs");
const csv = require("fast-csv");

const client = new discord.Client();
const prefix = botSettings.prefix;

client.on("ready", async () => {
	console.log("Delorean ONLINE")

	/*try{
		let link = await client.generateInvite();
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
		message.channel.send(`Pong!\n${Math.floor(client.ping)}ms`);
	}

	if(command === `${prefix}rate`){
		message.channel.send("Which week is the album from?");
		const collector = new discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 10000});
		collector.on("collect", message => {
			if(message.content == "5"){
				message.channel.send("YEET");
			}
			var stream = fs.createReadStream("albumdatabase.csv");
			csv
				.fromStream(stream)
				.on("data", function(data){
					console.log(data);
				})
				.on("end", function(){
					console.log("done!");
				});
		});
		collector.on("end", () => {
			message.channel.send("Message Timeout!");
			return;
		})
	}

	if(command === `${prefix}eval`){
		if(message.author.id != '196388136656437250') return;
		if(message.author.id == `196388136656437250`){
			message.channel.send(eval(args[0]));
		}
	}
});

client.login(botSettings.token);