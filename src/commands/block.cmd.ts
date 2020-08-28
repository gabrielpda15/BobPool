import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category } from '../util';
import { adminConfig } from '../../config.json';

export { Block as default };

class Block implements ICommand {

	public name: string = 'block';
	public description: string = 'Remove todos os cargos e bloqueia o usuario de todos os chats.';
	public usage: string[] = [ '[menção do usuário]' ];
	public category: category = category.ADMINISTRATIVE;
	public aliases: string[] = [];
	public onlyOwner: boolean = false;
	public requireArgs: boolean = true;
	public args: number = 1;

	public async execute(message: Discord.Message, args: string[]) {
        const target = message.mentions.members.first();
        await this.executeBlock(message, target, true);
    }
    
    public async executeBlock(message: Discord.Message, target: Discord.GuildMember, verbose?: boolean) {
        const blockedRole = message.guild.roles.cache.get(adminConfig.blockedRole);

        if (!target) {
            if (verbose) await message.reply(`tenha certeza que você mencionou um usuário no comando!`);
            return;
        }

        if (target.permissions.has('KICK_MEMBERS')) {
            if (verbose) await message.reply(`não é possivel bloquear ${target} pois possui direitos de moderação!`);
            return;
        }

        let msg: Discord.Message = null;
        if (verbose) msg = await message.channel.send(`Removendo cargo de ${target}...`);

        for (let role of target.roles.cache.values()) {
            if (role.id !== message.guild.roles.everyone.id)
                await target.roles.remove(role);
        }

        if (verbose) await msg.edit(`Bloqueando ${target}...`);

        target.roles.add(blockedRole);
        target.voice.setChannel(null);
        
        if (verbose) await msg.edit(`${target} foi bloqueado com sucesso!`);
    }
}