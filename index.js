const fs = require('fs-js');
const Discord = require('discord.js');
const config = require('./config.json');
const { log, activityLoop, getMention, groupBy } = require('./util.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.cmd.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  activityLoop(client, 0);
});

client.on('message', async msg => {
  const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
  const prefix = msg.content.match(prefixMention) ? msg.content.match(prefixMention)[0] : config.prefix;

  if (msg.author.bot || msg.channel.type === 'dm' || !msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.args && !args.length) {
		let reply = `Você não providenciou nenhum argumento, ${message.author}!`;

		if (command.usage) {
			reply += `\nO modo correto de usar esse comando seria: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

  try {
    await command.execute(msg, args);
    log(client, msg, `Comando ${commandName} utilizado.`);
  }
  catch (error) {
    console.error(error);
    log(client, msg, error);
    msg.reply('Aconteceu um erro ao executar esse comando!');
  }
});

console.log(`Connecting to discord...`);
client.login(config.token);