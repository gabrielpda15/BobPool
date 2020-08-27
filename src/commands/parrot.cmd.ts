import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category } from '../util';
import { convertJson } from '../json.util';

export { Parrot as default };

class Parrot implements ICommand {

	public name: string = 'parrot';
	public description: string = 'Repete a mensagem que você enviar, apagando a original.';
	public usage: string[] = [ '[mensagem]' ];
	public category: category = category.INFORMATION;
	public aliases: string[] = [];
	public onlyOwner: boolean = false;
	public requireArgs: boolean = true;
	public args: number = 1;

	public async execute(message: Discord.Message, args: string[]) {
        await message.delete();
        const value = args.join(' ');
        await message.channel.send(value);
	}
}