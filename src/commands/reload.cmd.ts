import * as Discord from 'discord.js';
import * as fs from 'fs';
import { ICommand } from '../command';
import { category, createEmbed } from '../util';
import { Bot } from '../bot';

export { Reload as default };

class Reload implements ICommand {

	public name: string = 'reload';
	public description: string = 'Recarrega os comandos do servidor.';
	public usage: string[] = [ '' ];
	public category: category = category.DEV;
	public aliases: string[] = [];
	public onlyOwner: boolean = true;
	public requireArgs: boolean = false;
	public args: number = 0;

	public async execute(message: Discord.Message, args: string[]) {
        try {
            await message.delete();
            const commandFiles = fs.readdirSync('./src/commands');
            (message.client as Bot).importCommands(commandFiles);
            await message.channel.send('Comandos recarregados com sucesso!');
        }
        catch (error) {
            let embed = createEmbed('Houve um erro ao recarregar os comandos!', `\n\n\`\`\`${error}\`\`\``);
            embed = embed.setFooter('Essa mensagem será excluida em 10 segundos.');
            let msg = await message.channel.send({ embeds: [ embed ] });
            setTimeout(async () => { await msg.delete(); }, 10000);
        }
	}
}