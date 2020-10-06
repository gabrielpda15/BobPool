import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category, createEmbed } from '../util';
import { adminConfig } from '../../config.json';

export { Rft as default };

class Rft implements ICommand {

	public name: string = 'rft';
	public description: string = 'Comandos do torneio.';
	public usage: string[] = [ '<team|game|clear|clearall>' ];
	public category: category = category.ADMINISTRATIVE;
	public aliases: string[] = [];
	public onlyOwner: boolean = true;
	public requireArgs: boolean = true;
	public args: number = 1;

	public async execute(message: Discord.Message, args: string[]) {
        const roles = Array.prototype.concat(
            Object.keys(adminConfig.rft.teams),
            Object.keys(adminConfig.rft.games)
        ) as string[];
        roles.push(adminConfig.rft.participant);

        let msg: Discord.Message;

        switch (args[0]) {
            case 'team':
                const teams = Object.keys(adminConfig.rft.teams);
                if (teams.includes(args[1])) {
                    if (message.mentions.members.size >= 1) {
                        for (let member of message.mentions.members) {
                            member[1].roles.add((adminConfig.rft.teams as any)[args[1]]);
                        }
                        await message.channel.send(`Cargo adicionado com sucesso!`);
                    } else {
                        await message.channel.send(`Lembre-se de marcar ao menos um membro.`);
                    }
                } else {
                    await message.channel.send(`Os time são números entre ${teams[0]} e ${teams[teams.length - 1]}.`);
                }
                break;
            case 'game':
                const games = Object.keys(adminConfig.rft.games);
                if (games.includes(args[1])) {
                    if (message.mentions.members.size >= 1) {
                        for (let member of message.mentions.members) {
                            member[1].roles.add((adminConfig.rft.games as any)[args[1]]);
                        }
                        await message.channel.send(`Cargo adicionado com sucesso!`);
                    } else {
                        await message.channel.send(`Lembre-se de marcar ao menos um membro.`);
                    }
                } else {
                    await message.channel.send(`Os games são letras entre ${games[0]} e ${games[games.length - 1]}.`);
                }
            case 'clear':
                if (message.mentions.members.size >= 1) {
                    for (let member of message.mentions.members) {
                        for (let role of member[1].roles.cache.values()) {
                            if (roles.includes(role.id))
                                await member[1].roles.remove(role);
                        }
                    }
                    await message.channel.send(`Cargos removidos com sucesso!`);
                } else {
                    await message.channel.send(`Lembre-se de marcar ao menos um membro.`);
                }
            case 'clearall':
                msg = await message.channel.send(`Removendo membros de ${roles.length} cargos...`);
                let msg2 = await message.channel.send(`Iniciando...`);
                let k = 0;
                for (let role of roles.map(x => message.guild.roles.cache.get(x))) {
                    let n = 0;
                    const t = role.members.size;
                    let msg2 = await msg.edit(`Removendo cargo \`${role.name}\`. (${n}/${t})`);
                    for (let member of role.members) {
                        await member[1].roles.remove(role.id);
                        await msg2.edit(`Removendo cargo \`${role.name}\`. (${++n}/${t})`);
                    }
                    await msg.edit(`Cargo \`${role.name}\` removido de ${t} membros com sucesso. ${++k}/${roles.length} restantes.`);
                }
                await msg2.delete();
                msg.edit(`Removido ${roles.length} cargos dos usuários.`)                
        }
	}
}