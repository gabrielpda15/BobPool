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
        const blockedRole = message.guild.roles.cache.get(adminConfig.blockedRole);

        if (!target) {
            await message.reply(`tenha certeza que você mencionou um usuário no comando!`);
            return;
        }

        if (target.permissions.has('KICK_MEMBERS')) {
            await message.reply(`não é possivel bloquear ${target} pois possui direitos de moderação!`);
            return;
        }

        let msg = await message.channel.send(`Removendo cargo de ${target}...`);

        for (let role of target.roles.cache.values()) {
            if (role.id !== message.guild.roles.everyone.id)
                await target.roles.remove(role);
        }

        await msg.edit(`Bloqueando ${target}...`);

        target.roles.add(blockedRole);
        
        await msg.edit(`${target} foi bloqueado com sucesso!`);
	}
}