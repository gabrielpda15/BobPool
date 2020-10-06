import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category, createEmbed } from '../util';
import { adminConfig } from '../../config.json';

export { Rft as default };

class Rft implements ICommand {

	public name: string = 'rft';
	public description: string = 'Comandos do torneio.';
	public usage: string[] = [ '<sub|team|game|clear|clearall>' ];
	public category: category = category.ADMINISTRATIVE;
	public aliases: string[] = [];
	public onlyOwner: boolean = true;
	public requireArgs: boolean = true;
	public args: number = 1;

	public async execute(message: Discord.Message, args: string[]) {
        const roles = Array.prototype.concat(
            Object.values(adminConfig.rft.teams),
            Object.values(adminConfig.rft.games)
        ) as string[];
        roles.push(adminConfig.rft.participant);
        console.log(roles.join(', '));

        let msg: Discord.Message;
        await message.delete();

        switch (args.shift()) {
            case 'sub':
                args.shift();
                const subArgs = args.join(' ').split('&');
                if (subArgs.length == 4) {
                    const embed = createEmbed('Inscrição do Torneio', `
                        Nome: ${subArgs[0]}\n
                        Email: ${subArgs[1]}\n
                        Discord: ${subArgs[2]}\n
                        Nick do LoL: ${subArgs[3]}\n
                    `);
                    await message.mentions.channels.first().send(embed);
                } else {
                    msg = await message.channel.send('São necessário exatos 4 argumentos para esse comando.');
                }
                break;
            case 'team':
                const teams = Object.keys(adminConfig.rft.teams);
                if (teams.includes(args[0])) {
                    if (message.mentions.members.size >= 1) {
                        for (let member of message.mentions.members) {
                            member[1].roles.add((adminConfig.rft.teams as any)[args[0]]);
                        }
                        msg = await message.channel.send(`Cargo adicionado com sucesso!`);
                    } else {
                        msg = await message.channel.send(`Lembre-se de marcar ao menos um membro.`);
                    }
                } else {
                    msg = await message.channel.send(`Os time são números entre ${teams[0]} e ${teams[teams.length - 1]}.`);
                }
                break;
            case 'game':
                const games = Object.keys(adminConfig.rft.games);
                if (games.includes(args[0])) {
                    if (message.mentions.members.size >= 1) {
                        for (let member of message.mentions.members) {
                            member[1].roles.add((adminConfig.rft.games as any)[args[0]]);
                        }
                        msg = await message.channel.send(`Cargo adicionado com sucesso!`);
                    } else {
                        msg = await message.channel.send(`Lembre-se de marcar ao menos um membro.`);
                    }
                } else {
                    msg = await message.channel.send(`Os games são letras entre ${games[0]} e ${games[games.length - 1]}.`);
                }
                break;
            case 'clear':
                if (message.mentions.members.size >= 1) {
                    for (let member of message.mentions.members) {
                        for (let role of member[1].roles.cache.values()) {
                            if (roles.includes(role.id))
                                await member[1].roles.remove(role.id);
                        }
                    }
                    msg = await message.channel.send(`Cargos removidos com sucesso!`);
                } else {
                    msg = await message.channel.send(`Lembre-se de marcar ao menos um membro.`);
                }
                break;
            case 'clearall':
                msg = await message.channel.send(`Removendo membros de ${roles.length} cargos...`);
                let msg2 = await message.channel.send(`Iniciando...`);
                let k = 0;
                for (let role of roles.map(x => message.guild.roles.cache.get(x))) {
                    let n = 0;
                    const t = role.members.size;
                    await msg2.edit(`Removendo cargo \`${role.name}\`. (${n}/${t})`);
                    for (let member of role.members) {
                        await member[1].roles.remove(role.id);
                        await msg2.edit(`Removendo cargo \`${role.name}\`. (${++n}/${t})`);
                    }
                    await msg.edit(`Cargo \`${role.name}\` removido de ${t} membros com sucesso. ${++k}/${roles.length} restantes.`);
                }
                await msg2.delete();
                msg.edit(`Removido ${roles.length} cargos dos usuários.`);
                break;
            default:
                msg = await message.channel.send(`As unicas opções para argumentos são: ${this.usage[0]}`);
                break;
        }

        setTimeout(async () => await msg.delete(), 5000);
	}
}