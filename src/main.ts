import * as fs from 'fs';
import * as Discord from 'discord.js';
import { logOnChannel, log, activityLoop, severity } from './util';
import { client } from './index';
import config from '../config.json';
import messages from './messages/messages';
import emojis from './emojis.json';

export class Program {
  
  constructor() {    
    const commandFiles = fs.readdirSync('./src/commands');
    client.importCommands(commandFiles);
  }

  public addListeners(): void {
    client.on('debug', this.onDebug);
    client.on('ready', this.onReady);
    client.on('message', this.onMessage);
    client.on('messageReactionAdd', this.onReactionAdded);
  }

  public async start(): Promise<void> {
    try {
      const dotenv = await import('dotenv').catch(error => { throw error; });
      let result;
      if (process.env.TS_NODE_DEV) result = dotenv.config({ path: `${__dirname}\\..\\.env` });
      else result = dotenv.config({ path: '../.env' });
      if (result.parsed) log('Successfuly applied environment variables!', 'DOTENV', severity.INFO);
      else log(result.error.message, 'DOTENV', severity.ERROR);
    }
    catch (error) {
      log('Missing dotenv dependencies, skipping it!', 'NODEJS', severity.WARN);
    }
    
    log(`Connecting to discord...`, 'DISCORD', severity.INFO);
    if (process.env.token)
      await client.login(process.env.token);
    else
      log('The token is invalid! Try restarting the bot!', 'TOKEN', severity.CRIT);
  }

  private async onDebug(value: string): Promise<void> {
    log(value, 'DISCORD', severity.DEBUG);
  }

  private async onReady(): Promise<void> {
    try {
      log(`Logged in as ${client.user.tag}!`, 'DISCORD', severity.INFO);  
      for (let guild of client.guilds.cache.values()) {
        for (let channel of guild.channels.cache.values()) {
          if (channel.type == 'GUILD_TEXT') {
            let textChannel = (channel as Discord.TextChannel);
            try { await textChannel.messages.fetch({ limit: 20 }); } catch { }
          }
        }
      }
      await activityLoop(client, 0);  
      log(`Ready!`, 'DISCORD', severity.INFO);
    }
    catch (error) {
      log(<string>error, 'NODEJS', severity.ERROR);
    }
  }

  private async onMessage(msg: Discord.Message): Promise<void> {
    try {
      const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
      const prefix = msg.content.match(prefixMention) ? msg.content.match(prefixMention)[0] : process.env.prefix;
  
      if (msg.author.bot || msg.channel.type === 'DM' || !msg.content.startsWith(prefix)) return;
  
      const isWhiteListed = config.adminConfig.whiteList.findIndex(x => x === msg.channel.id) != -1;
      const isOwner = (msg.author.id == msg.guild.ownerId) || config.adminConfig.bypass.includes(msg.author.id);
      const isAdmin = msg.member.permissions.has('MANAGE_GUILD');
  
      if (!isOwner && (!isAdmin || !isWhiteListed)) {
        if (isAdmin) {
          await msg.delete();
          const dm = await msg.author.createDM();
          await dm.send('Esse canal não está na whitelist do servidor!\nFale com o administrador do bot caso isso seja um erro!');
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
      log(<string>error, 'NODEJS', severity.ERROR);
      logOnChannel(client, msg, <string>error);
      await msg.channel.send('Aconteceu um erro ao executar esse comando!');
    }
  }
  
  private async onReactionAdded(r: Discord.MessageReaction | Discord.PartialMessageReaction, u: Discord.User | Discord.PartialUser): Promise<void> {
    try {
      if (Object.values(config.adminConfig.trackedMessages).includes(r.message.id)) {        
        const chat = Object.keys(config.adminConfig.trackedMessages)
          .find(k => (config.adminConfig.trackedMessages as any)[k] === r.message.id);
        await r.users.remove(u.id);
        let emoji = '';
        let index = Object.values(emojis).indexOf(r.emoji.name);
        if (index >= 0) {
          emoji = '&' + Object.keys(emojis)[index];
        } else {
          emoji = r.emoji.id;
        }

        let temp = (messages as any)[chat].reactions;
        if (!temp) return;
        
        let reaction: { type: string, value: string } = temp[emoji];
        
        switch (reaction.type) {
          case 'dm':
            const dm = await u.createDM();
            await dm.send(reaction.value);
            break;
          case 'role':
            const role = r.message.guild.roles.cache.get(reaction.value);
            const user = r.message.guild.members.cache.get(u.id);
            if (user.roles.cache.some(r => r.id == role.id)) {
              await user.roles.remove(role);
            } else {
              await user.roles.add(role);
            }
            break;
        }
      }
    }
    catch (error) {
      log(<string>error, 'NODEJS', severity.ERROR);
    }
  }

}