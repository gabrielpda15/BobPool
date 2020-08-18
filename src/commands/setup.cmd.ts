import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category, createEmbed, ReactionHandler } from '../util';
import { Bot } from '../bot';
import messages from '../messages/messages';
import { convertJson } from '../json.util';
import emojis from '../emojis.json';

export { Setup as default };

class Setup implements ICommand {

	private options: string[] = Object.keys(messages);

	public name: string = 'setup';
    public description: string = 'Configura canais do tipo selecionado';
	public usage: string[] = [ `[${this.options.join('|')}]` ];
	public category: category = category.ADMINISTRATIVE;
	public aliases: string[] = [];
	public onlyOwner: boolean = false;
	public requireArgs: boolean = true;
	public args: number = 1;

	public async execute(message: Discord.Message, args: string[]) {		
		if (!this.options.includes(args[0])) {
			let errorMsg = await message.channel.send(
				`Desculpe, mas essa opção não existe! Tente usar umas das opções abaixo:\n` +
				this.options.map(x => `\`${x}\``).join(', '));
			setTimeout(async () => {
				await message.delete();
				await errorMsg.delete();
			}, 8000);
			return;
		}

		await message.delete();

		let json = (messages as any)[args[0]];
		let result = convertJson(json);

		let msg = await message.channel.send(result);

		if (json.reactions) {
			for (var emoji in json.reactions) {
				if (emoji.startsWith('&')) {
					await msg.react((emojis as any)[emoji.substr(1)]);
				} else {
					await msg.react(message.guild.emojis.cache.get(emoji));
				}
			}

			msg = await message.channel.send(
				`Use o id \`${msg.id}\` na configuração do bot para habilitar o reconhecimento das reações`);

			setTimeout(async () => await msg.delete(), 10000);
		}
	}
}