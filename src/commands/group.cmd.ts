import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category, ReactionHandler, getMention } from '../util';
import { convertJson } from '../json.util';

export { Group as default };

class Group implements ICommand {

	public name: string = 'group';
	public description: string = 'Transforma o json enviado em um embed e adiciona cada membro que reagir em uma lista';
	public usage: string[] = [ '[json do embed]' ];
	public category: category = category.INFORMATION;
	public aliases: string[] = [ 'tournament', 'championship' ];
	public onlyOwner: boolean = false;
	public requireArgs: boolean = true;
    public args: number = 1;
    
    private emoji: string = '745704339573571735';

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

        const json = JSON.parse(args.join(' '));
        if (json.type != 'embed' || isNaN(json.timeout)) {
            await message.channel.send(`Utilize \`${process.env.prefix}group template\` e verifique o formato aceito!`);
            return;
        }

        let list: string[] = [];

        const embed = convertJson(json) as Discord.MessageEmbed;
        let msg = await message.channel.send({ embeds: [ embed ]});
        await msg.react(message.guild.emojis.cache.get(this.emoji));

        embed.addField('Participantes', 'Nenhum');
        
        const reloadEmbed = async () => {
            embed.fields[embed.fields.length - 1].value = list.length == 0 ? 'Nenhum' : list.map(x => getMention(x)).join(', ');
            await msg.edit({ embeds: [ embed ]});
        };

        const reactionAdded: ReactionHandler = async (r, u) => {
            list.push(u.id);
            await reloadEmbed();
        };

        const reactionRemoved: ReactionHandler = async (r, u) => {
            list = list.filter(x => x != u.id);
            await reloadEmbed();
        };

        reloadEmbed();
        message.client.on('messageReactionAdd', reactionAdded);
        message.client.on('messageReactionRemove', reactionRemoved);

        setTimeout(async () => {
            message.client.removeListener('messageReactionAdd', reactionAdded);
            message.client.removeListener('messageReactionRemove', reactionRemoved);
            await msg.reactions.removeAll();
        }, json.timeout);
	}
}