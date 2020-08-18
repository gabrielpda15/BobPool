const fs = require('fs-js');
const Discord = require('discord.js');
const config = require('./config.json');
const { logOnChannel, log, activityLoop, severity } = require('./util.js');
try { require('dotenv').config(); } catch (error) { log('Missing dotenv dependencies, assuming it\'s a release.', 'NODEJS', severity.WARN)  }

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.findCommand = function(value) {
  return this.commands.get(value) || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(value));
};

client.on('debug', (value) => {
  log(value, 'DISCORD', severity.DEBUG);
});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.cmd.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', async () => {
  log(`Logged in as ${client.user.tag}!`, 'DISCORD', severity.INFO);
  await activityLoop(client, 0);
});

client.on('message', async msg => {
  try {
    const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
    const prefix = msg.content.match(prefixMention) ? msg.content.match(prefixMention)[0] : process.env.prefix;

    if (msg.author.bot || msg.channel.type === 'dm' || !msg.content.startsWith(prefix)) return;

    const isWhiteListed = config.adminConfig.whiteList.findIndex(x => x === msg.channel.id) != -1;
    const isOwner = msg.author.id == msg.guild.ownerID;
    const isAdmin = msg.member.permissions.has('MANAGE_GUILD');

    if (!isOwner && (!isAdmin || !isWhiteListed)) {
      if (isAdmin) {
        await msg.delete();
        const dm = await msg.author.createDM();
        await dm.send('Esse canal não está na white-list do servidor!\nFale com o administrador do bot caso isso seja um erro!');
      }
      return;
    }

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.findCommand(commandName);
    if (!command) return;

    if (command.onlyOwner && !isOwner) {
      await msg.reply('esse comando é restrito ao dono do server!');
      return;
    }

    if (command.requireArgs && !args.length) {
      let reply = '';

      if (command.args > args.length) 
        reply = `${msg.author}, você providenciou apenas ${args.length}/${command.args} dos argumentos necessários`;
      else
        reply = `${msg.author}, esse comando requer argumentos!`;

      if (command.usage) {
        reply += `\nO modo correto de usar esse comando seria: \`${prefix}${command.name} ${command.usage}\``;
      }

      await msg.channel.send(reply);
      return;
    }
    
    await command.execute(msg, args);
    await logOnChannel(client, msg, `Comando ${commandName} utilizado.`);
  }
  catch (error) {
    log(error, 'JS', severity.ERROR);
    logOnChannel(client, msg, error);
    await msg.channel.send('Aconteceu um erro ao executar esse comando!');
  }
});

log(`Connecting to discord...`, 'DISCORD', severity.INFO);
client.login(process.env.token);
