import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category } from '../util';

export { Status as default };

class Status implements ICommand {

    public name: string = 'status';
	public description: string = 'Deixa o bot invisivel ou online.';
	public usage: string[] = [ '[inv|online]' ];
	public category: category = category.INFORMATION;
	public aliases: string[] = [];
	public onlyOwner: boolean = true;
	public requireArgs: boolean = true;
    public args: number = 1;
    
    public async execute(message: Discord.Message, args: string[]) {
        switch (args[0]) {
            case 'inv':
                message.client.user.setStatus('invisible');
                await message.channel.send('Pronto! Agora estou invisivel!');
                break;
            case 'online':
                message.client.user.setStatus('online');
                await message.channel.send('Pronto! Agora estou online!');
                break;
            default:
                await message.channel.send(`Opção inválida! Tente usar \`${process.env.prefix}${this.name}\``);
                break;
        }
    }

}