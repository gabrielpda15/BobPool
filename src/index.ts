import * as fs from 'fs';
import * as Discord from 'discord.js';
import { logOnChannel, log, activityLoop, severity } from './util';
import { Bot } from './bot';
import { ICommand } from './command';
import config from '../config.json';
import { reactions } from './messages/config.json'
import emojis from './emojis.json';
import { config as dotenvConfig } from 'dotenv';

if (!dotenvConfig) log('Missing dotenv dependencies, assuming it\'s a release.', 'NODEJS', severity.WARN);
else dotenvConfig();

const client = new Bot();

client.on('debug', (value) => {
  log(value, 'DISCORD', severity.DEBUG);
});

const commandFiles = fs.readdirSync('./src/commands');

client.importCommands(commandFiles);

client.on('ready', async () => {
  log(`Logged in as ${client.user.tag}!`, 'DISCORD', severity.INFO);  
  for (let guild of client.guilds.cache.array()) {
    for (let channel of guild.channels.cache.array()) {
      if (channel.type == 'text') {
        let textChannel = (channel as Discord.TextChannel);
        textChannel.messages.fetch({ limit: 20 });
      }
    }
  }
  await activityLoop(client, 0);  
  log(`Ready!`, 'DISCORD', severity.INFO);
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
    log(error, 'NODEJS', severity.ERROR);
    logOnChannel(client, msg, error);
    await msg.channel.send('Aconteceu um erro ao executar esse comando!');
  }
});

client.on('messageReactionAdd', async (r, u) => {
  if (config.adminConfig.configMessageId === r.message.id) {
    await r.users.remove(u.id);
    let emoji = '';
    let index = Object.values(emojis).indexOf(r.emoji.name);
    if (index >= 0) {
      emoji = '&' + Object.keys(emojis)[index];
    } else {
      emoji = r.emoji.id;
    }
    let reaction: {type:string, value:string} = (reactions as any)[emoji];
    switch (reaction.type) {
      case 'dm':
        const dm = await u.createDM();
        await dm.send(reaction.value);
        break;
      case 'role':
        const role = r.message.guild.roles.cache.get(reaction.value);
        await r.message.guild.members.cache.get(u.id).roles.add(role);
        break;
    }
  }
});

/*
if (config.adminConfig.configMessageId && config.adminConfig.configMessageId != '') {
  log(`Adding reactions tracker on message ${config.adminConfig.configMessageId}.`, 'DISCORD', severity.INFO);
  client.on('messageReactionAdd', async (r, u) => {
    console.log('reaction received');
    if (r.message.id === config.adminConfig.configMessageId) {
      let emoji = '';
      let index = Object.values(emojis).indexOf(r.emoji.name);
      if (index >= 0) {
        emoji = '&' + Object.keys(emojis)[index]
      } else {
        emoji = r.emoji.id;
      }
      let reaction: {type:string, value:string} = (reactions as any)[emoji]
      switch (reaction.type) {
        case 'dm':
          const dm = await u.createDM();
          await dm.send(reaction.value);
          break;
        case 'role':
          const role = r.message.guild.roles.cache.get(reaction.value);
          await r.message.guild.members.cache.get(u.id).roles.add(role);
          break;
      }
    }
  });
} */

log(`Connecting to discord...`, 'DISCORD', severity.INFO);
client.login(process.env.token);
