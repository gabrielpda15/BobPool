import * as Discord from 'discord.js';
import config from '../config.json';
import { StringDecoder } from 'string_decoder';

export enum severity {
    CRIT = 'CRIT',
    ERROR = 'ERROR',
    WARN = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    VERB = 'VERB'
};

export enum category {
    INFORMATION = 'Informativos',
    ADMINISTRATIVE = 'Administrativos',
    DEV = 'Desenvolvimento'
}

export async function activityLoop(client: Discord.Client, n: number) {
    let x = n;
    if (client.user) {
        await client.user.setActivity(config.activities[x++]);
    }
    if (x >= config.activities.length) x = 0;
    setTimeout(async () => await activityLoop(client, x), 10000);
}

export function getMention(id: string) {
    return `<@!${id}>`;
}

export async function logOnChannel(client: Discord.Client, msg: Discord.Message, text: string) {
    try {
        const channel = await client.channels.fetch(config.log.channel);
    
        if (channel && channel.type === 'GUILD_TEXT') {
            const txtChannel = channel as Discord.TextChannel;
            const logText = config.log.format
                .replace('{date}', new Date().toLocaleString(process.env.locale))
                .replace('{channel}', txtChannel.name)
                .replace('{channelMention}', getMention(msg.channel.id))
                .replace('{channel:1}', txtChannel.name.substr(1))
                .replace('{channel:2}', txtChannel.name.substr(2))
                .replace('{channel:3}', txtChannel.name.substr(3))
                .replace('{author}', `${msg.author.username}#${msg.author.discriminator}`)
                .replace('{authorMention}', getMention(msg.author.id))
                .replace('{text}', text);
            
            await txtChannel.send(logText);
        }
    } catch (error) {
        log(`Não possivel enviar o log para o canal ${config.log.channel}`, 'DISCORD', severity.ERROR);
    } 
}

export function log(txt: string, src: string, sev: severity) {
    const logText = config.log.consoleFormat
        .replace('{date}', new Date().toLocaleString(process.env.locale))
        .replace('{severity}', sev)
        .replace('{source}', src)
        .replace('{text}', txt);
        
    console.log(logText);
}

export function getRandom(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function createEmbed(title: string, desc: string) {
    let embed = new Discord.MessageEmbed();
    if (title) embed = embed.setTitle(title);
    if (desc) embed = embed.setDescription(desc);

    let colors = ['#00B02F', '#2800C9', '#BF0C00', '#A400C9', '#DB7900', '#FFEE00'];

    if (Array.isArray(config.embedColor)) colors = config.embedColor;

    if (config.embedColor === 'random' || Array.isArray(config.embedColor)) {
        embed = embed.setColor(colors[getRandom(0, colors.length)] as Discord.HexColorString);
    } else if (config.embedColor.startsWith('#') && config.embedColor.length == 7) {
        embed = embed.setColor(config.embedColor as Discord.HexColorString);
    }

    return embed;
}

export function groupBy<t, tv>(xs: t[], keySelector: (v:t) => string, mapper: (v:t) => tv): { [key: string]: tv[]} {
    return xs.reduce((rv, x) => {
        (rv[keySelector(x)] = rv[keySelector(x)] || []).push(mapper(x));
        return rv;
    }, {} as any);
};

export interface ReactionHandler {
    (args_0: Discord.MessageReaction | Discord.PartialMessageReaction, args_1: Discord.User | Discord.PartialUser): void;
}

interface String {
    capitalizeFirstLetter(): string;
}

declare global {
    interface String {
        capitalizeFirstLetter(): string;
    }
}

String.prototype.capitalizeFirstLetter = function (this: string) {
    return this.charAt(0).toUpperCase() + this.slice(1);
}