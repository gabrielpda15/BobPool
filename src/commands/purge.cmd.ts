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

        n = n + 2;

        await message.channel.send('Iniciando processo de exclusão...');

        for (let i = n; i > 0; i = i - 100) {
            if (n > 100) {
                await (message.channel as Discord.TextChannel).bulkDelete(100);
            } else {
                await (message.channel as Discord.TextChannel).bulkDelete(i);
            }
        }

        let msg = await message.channel.send(':white_check_mark: Pronto!!!');
        setTimeout(async () => await msg.delete(), 3000);
	}
}