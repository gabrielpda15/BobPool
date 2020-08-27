import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category } from '../util';
import { convertJson } from '../json.util';

export { Embed as default };

class Embed implements ICommand {

	public name: string = 'embed';
	public description: string = 'Transforma o json enviado em um embed';
	public usage: string[] = [ '[json do embed]' ];
	public category: category = category.INFORMATION;
	public aliases: string[] = [];
	public onlyOwner: boolean = false;
	public requireArgs: boolean = true;
	public args: number = 1;

	public async execute(message: Discord.Message, args: string[]) {
        const json = args.join(' ');
        const embed = convertJson(JSON.parse(json));
        await message.channel.send(embed);
	}
}