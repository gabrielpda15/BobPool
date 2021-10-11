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
        await message.delete();

        if (['template', 'help', 'format', '?'].includes(args[0])) {
            message.channel.send(`\`\`\`json
{
    "type": "embed",
    "title": "TITULO",
    "description": [ "DESCRICAO", " EM UMA SÓ LINHA" ],
    "timeout": 10000,
    "thumbnailUrl": "URL",
    "fields": [
        { "title": "TITULO", "description": [ "DESCRICAO" ] }
    ]
}\`\`\``);
            return;
        }

        const json = args.join(' ');
        const embed = convertJson(JSON.parse(json));
        if (typeof embed == 'string') return;
        await message.channel.send({ embeds: [ embed ]});
	}
}