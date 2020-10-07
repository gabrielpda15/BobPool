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
        
        let n = +args[0];

        if (isNaN(n) && n > 1) {
            await message.channel.send(`O argumento \`${n}\` deve ser um numero inteiro maior que um!`);
            return;
        }

        if (message.mentions.members.size == 1) {
            await message.delete();
            const mentionedUser = message.mentions.members.first();           

            if (message.author.id === mentionedUser.id) n = n + 1;
            
            let tempMsg = await message.channel.send('Iniciando processo de exclusão...');

            let i = n;
            while (i > 0) {
                let temp = await message.channel.messages.fetch({limit: 100});
                temp = temp.filter(m => m.author.id == mentionedUser.id);
                let count = 0;
                temp = temp.reduce((rv, e) => {
                    if (count++ < i) {
                        return rv.set(e.id, e);
                    }
                    return rv;
                }, new Discord.Collection<string, Discord.Message>());
                await (message.channel as Discord.TextChannel).bulkDelete(temp, false);
                i = i - temp.size;
            }

            await tempMsg.edit(':white_check_mark: Pronto!!!');
            setTimeout(async () => await tempMsg.delete(), 3000);
            return;
        } else if (message.mentions.members.size > 1) {
            await message.channel.send(':x: Mencione apenas um membro!');
            return;
        }

        n = n + 2;

        await message.channel.send('Iniciando processo de exclusão...');

        for (let i = n; i > 0; i = i - 100) {
            if (i > 100) {
                await (message.channel as Discord.TextChannel).bulkDelete(100);
            } else {
                await (message.channel as Discord.TextChannel).bulkDelete(i);
            }
        }

        let msg = await message.channel.send(':white_check_mark: Pronto!!!');
        setTimeout(async () => await msg.delete(), 3000);
	}
}