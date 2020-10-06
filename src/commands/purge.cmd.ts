import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category } from '../util';
import { convertJson } from '../json.util';

export { Purge as default };

class Purge implements ICommand {

	public name: string = 'purge';
	public description: string = 'Apaga o numero de mensagens definidas. Opcionalmente de um usuário apenas';
	public usage: string[] = [ '[nº menssagens] <menção usuário>' ];
	public category: category = category.ADMINISTRATIVE;
	public aliases: string[] = [ 'clear', 'prune'];
	public onlyOwner: boolean = false;
	public requireArgs: boolean = true;
	public args: number = 1;

	public async execute(message: Discord.Message, args: string[]) {
        
        if (isNaN(+args[0]) && +args[0] > 0) {
            await message.channel.send(`O argumento \`${args[0]}\` deve ser um numero inteiro maior que zero!`);
            return;
        }

        await message.delete();
        let msg = await message.channel.send('Iniciando processo de exclusão...');
        const mentionedUsers = message.mentions.members.size > 0 ? 
            (Object.values(message.mentions.members) as Discord.GuildMember[]).map(x => x.id) :
            [];
        let done = false;
        let count = 0;

        while (!done) {
            const limit = +args[0] - count > 50 ? 50 : +args[0] - count + 1;
            let messages = await message.channel.messages.fetch({ limit: limit });

            for (let item of messages) {
                if (item[0] != msg.id) {
                    if (mentionedUsers.length > 0) {
                        if (mentionedUsers.includes(item[1].author.id)) {
                            await item[1].delete();
                            count++;
                            await msg.edit(`Excluida ${count}/${args[0]} mensagens!`);
                        }
                    } else {
                        await item[1].delete();
                        count++;
                        await msg.edit(`Excluida ${count}/${args[0]} mensagens!`);
                    }
    
                    if (count >= Number.parseInt(args[0])) {
                        done = true;
                        break;
                    }
                }               
            }
        }

        await msg.edit(`Finalizado!`);
        setTimeout(async () => await msg.delete(), 5000);        
	}
}