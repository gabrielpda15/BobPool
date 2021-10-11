import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { groupBy, category, createEmbed, logOnChannel as log } from '../util';
import util = require('../util');
import { Bot } from '../bot';
import { stringify } from 'querystring';

export { Help as default };

class Help implements ICommand {

    public name: string = 'help';
	public description: string = 'Lista todos os comandos ou obtem ajuda de um comando especifico.';
	public usage: string[] = [ '', '<nome do comando>' ];
	public category: category = category.INFORMATION;
	public aliases: string[] = [ 'commands' ];
	public onlyOwner: boolean = false;
	public requireArgs: boolean = false;
	public args: number = 0;

	public async execute(message: Discord.Message, args: string[]) {
		let embed = new Discord.MessageEmbed();
    
        if (args && args.length > 0) {
            const command = (message.client as Bot).findCommand(args[0]);
            if (command) {
                embed = createEmbed(`Comando: ${command.name.capitalizeFirstLetter()}`, command.description);
                let temp: string = null;
                if (command.aliases) {
                    temp = command.aliases.map(x => `\`${x}\``).join(', ');
                    if (temp && temp != '') embed = embed.addField('Atalhos', temp);
                }
                if (command.usage) {
                    let title = 'Uso';
                    if (command.usage.length > 1) title = 'Usos';
                    temp = command.usage.map(x => x != '' ? `\`${process.env.prefix}${command.name} ${x}\`` : `\`${process.env.prefix}${command.name}\``).join('\n');
                    if (temp && temp != '') embed = embed.addField(title, temp);
                }
                await message.channel.send({ embeds: [embed] });
            } else {
                await message.channel.send(`Desculpe não conheço o comando \`${args[0]}\`!`);
            }
            return;
        }

        embed = createEmbed('Todos os Comandos', 
            `Utilize \`${process.env.prefix}help <nome do comando>\` para obter ajuda mais detalhada!`);

        let result = groupBy(Array.from((message.client as Bot).commands.values()), x => x.category, x => `\`${x.name}\``);
        
        for (let key in result) {
            const desc = result[key].join(', ');
            if (key != category.DEV && desc && desc != null) {
                embed.addField(key, desc);
            }
        }

        await message.channel.send({ embeds: [ embed ] });
    }
    
}