import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category, createEmbed, ReactionHandler, getMention } from '../util';
import { adminConfig } from '../../config.json';
import punishes from '../messages/punishes.json';
import emojis from "../emojis.json";
import { stringify } from 'querystring';
import block from './block.cmd';

export { Punish as default };

type votesType = { [key: string]: string[] };
type punishesType = { [key: string]: punishItemType };
type punishItemType = { action?: string, 
                      limit?: number,
                      priority?: number,
                      title?: string,
                      result?: string,
                      text?: string,
                      dm?: string }

const times = {
    "one": 1,
    "three": 3,
    "five": 5,
    "seven": 7,
    "ten": 10
};

const metrics = {
    "h": "horas",
    "d": "dias",
    "s": "semanas",
    "m": "meses"
}

class Punish implements ICommand {

	public name: string = 'punish';
	public description: string = 'Abre uma votação de punimento para a pessoa marcada.';
	public usage: string[] = [ '[menção do usuário] [motivo]' ];
	public category: category = category.ADMINISTRATIVE;
	public aliases: string[] = [];
	public onlyOwner: boolean = false;
	public requireArgs: boolean = true;
	public args: number = 2;

	public async execute(message: Discord.Message, args: string[]) {
        const target = message.mentions.members.first();

        if (!target) {
            await message.reply(`tenha certeza que você mencionou um usuário no comando!`);
            return;
        }

        if (target.permissions.has('KICK_MEMBERS')) {
            await message.reply(`não é possivel punir ${target} pois possui direitos de moderação!`);
            return;
        }

        if (message.attachments.size > 1) {
            await message.reply(`envie apenas uma imagem com o comando!`);
            return;
        }

        const targetMention = target.toString().replace('!', '');
        const argsMention = args.shift().replace('!', '');

        if (targetMention != argsMention) {
            await message.reply(`lembre-se de primeiro marcar o usuario e depois escrever o motivo!`);
            return;
        }

        const reason = args.join(' ');
        const evidence = message.attachments.first();

        let embed = this.getPunishVoteEmbed(message.member.toString(), target.toString(), reason, evidence);
        let msg = await message.channel.send({ embeds: [ embed ]});

        let votes: votesType = {};

        for (let key in punishes) {
            votes[key] = [];
            await msg.react((emojis as any)[key]);
        }

        const voteContains = (u: string) => {
            let users = Object.values(votes).reduce((rv, x) => {
                x.forEach(y => rv.push(y));
                return rv;
            }, []);
            return users.includes(u);
        };

        const onReaction: ReactionHandler = async (r, u) => {
            if (r.message.id != msg.id) return;            
            await r.users.remove(u.id);
            const emoji = Object.keys(emojis).find(x => (emojis as any)[x] === r.emoji.name);
            if (Object.keys(punishes).includes(emoji)) {
                if (!voteContains(u.id)) {
                    votes[emoji].push(u.id);
                }
            }
        };

        message.client.on('messageReactionAdd', onReaction);

        setTimeout(async () => {
            message.client.removeListener('messageReactionAdd', onReaction);
            await msg.reactions.removeAll();
            const nVotes = Object.values(votes).reduce((rv, x) => { rv += x.length; return rv }, 0);
            
            let arrayVotes = Object.keys(votes).map(x => { return { key: x, value: votes[x] } });
                     
            let sorted = arrayVotes.sort((a, b) => { 
                if (a.value.length > b.value.length) return -1;
                else if (a.value.length < b.value.length) return 1;
                else if ((punishes as punishesType)[a.key].priority > (punishes as punishesType)[b.key].priority) return -1;
                else return 1;
            });

            let result: { key: string, value: string[] };

            for (let i = 0; i < sorted.length; i++) {
                const limit = (punishes as punishesType)[sorted[i].key].limit;
                if (limit != null) {
                    console.log(sorted[i].value.length / nVotes);
                    if (sorted[i].value.length / nVotes >= limit) {
                        result = sorted[i];
                        break;
                    }
                } else {
                    result = sorted[i];
                    break;
                }
            }

            await msg.edit({ embeds: [ this.getPunishEndVoteEmbed(embed, votes, (punishes as punishesType)[result.key].result, evidence) ] });

            let tempBlock = '';
            
            switch ((punishes as punishesType)[result.key].action) {
                case 'ban':
                    if (target.bannable) target.ban({ reason: reason });
                    else message.channel.send('Aparentemente essa pessoa não pode ser banida!');
                    break;
                case 'kick':
                    if (target.kickable) target.kick(reason);
                    else message.channel.send('Aparentemente essa pessoa não pode ser expulsa!');
                    break;
                case 'block':
                    msg = await message.channel.send('Por quanto tempo ele(a) deve ser bloqueado?');
                    
                    for (let emoji of Object.keys(times).map(x => (emojis as any)[x])) await msg.react(emoji);                    
                    const filter: Discord.CollectorFilter<[Discord.MessageReaction, Discord.User]> = (r, u) => u.id === message.member.id;
                    const timeReactions = await msg.awaitReactions({ filter: filter, max: 1, time: 10000 });
                    await msg.reactions.removeAll();
                    const timeKey = Object.keys(emojis).find(x => (emojis as any)[x] === timeReactions.first().emoji.name);

                    for (let emoji of Object.keys(metrics).map(x => (emojis as any)[x])) await msg.react(emoji);
                    const metricReactions = await msg.awaitReactions({ filter: filter, max: 1, time: 10000 });
                    await msg.reactions.removeAll();
                    const metricKey = Object.keys(metrics).find(x => (emojis as any)[x] === metricReactions.first().emoji.name);

                    tempBlock = `${(times as any)[timeKey]} ${(metrics as any)[metricKey]}`;
                    await msg.delete();

                    const blockCmd = new block();
                    blockCmd.executeBlock(message, target);

                    break;
                case 'none':
                default:
                    break;
            }

            const punishChannel = message.guild.channels.cache.get(adminConfig.punishChannel) as Discord.TextChannel;
            await punishChannel.send({ embeds: [ this.getPunishEmbed((punishes as punishesType)[result.key], votes, reason, target.toString(), evidence, false, tempBlock) ] });
            const dmChannel = await target.createDM(true);
            await dmChannel.send({ embeds: [ this.getPunishEmbed((punishes as punishesType)[result.key], votes, reason, target.toString(), evidence, true, tempBlock) ] });
            
        }, 10000);        
    }
    
    private getPunishEmbed(result: punishItemType, votes: votesType, reason: string, target: string, evidence?: Discord.MessageAttachment, isTargetDm?: boolean, tempBlock?: string): Discord.MessageEmbed {
        let embed: Discord.MessageEmbed = null;

        if (isTargetDm) {
            embed = createEmbed(`Punição - ${result.title}`, result.dm.replace('{{time}}', tempBlock))
                .addField('Motivo', reason);
            if (evidence) embed = embed.setImage(evidence.proxyURL);
        } else {
            const members = Object.values(votes).reduce((rv, x) => { x.forEach(y => rv.push(getMention(y))); return rv; }, []);
            const strVotes = Object.keys(votes).map(x => `${votes[x].length} ${votes[x].length == 1  ? 'voto' : 'votos'} para ${(punishes as punishesType)[x].title.toLowerCase()}`);
            embed = createEmbed(`Punição - ${result.title}`, result.text.replace('{{target}}', target).replace('{{time}}', tempBlock))
                .addField('Motivo', reason)
                .addField('Votos', `Houve ${strVotes.join(', ')}`)
                .addField('Membros presentes', members.join(', '));
            if (evidence) embed = embed.setImage(evidence.proxyURL);
        }
        return embed;
    }

    private getPunishVoteEmbed(requester: string, target: string, reason: string, evidence?: Discord.MessageAttachment): Discord.MessageEmbed {
        let embed = createEmbed('Votação de Punimento', `${requester} abriu uma votação de punimento para ${target}`)
            .addField('Motivo', reason);
        if (evidence) embed = embed.setImage(evidence.proxyURL);
        return embed;
    }
    
    private getPunishEndVoteEmbed(embed: Discord.MessageEmbed, votes: votesType, 
                                  resultado: string, evidence?: Discord.MessageAttachment): Discord.MessageEmbed {
        let votesStr = '';
        
        for (let emoji in votes) {
            votesStr += `${(emojis as any)[emoji]} : ${votes[emoji].length} ${votes[emoji].length == 1 ? 'voto' : 'votos'}\n`;
        }

        embed = embed.addField('Votos', votesStr).addField('Resultado', resultado);

        if (evidence) embed = embed.setImage(evidence.proxyURL);

        return embed;
    }
}