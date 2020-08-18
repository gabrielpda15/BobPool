import * as Discord from 'discord.js';
import { ICommand } from '../command';
import { category } from '../util';

export { Ping as default };

class Ping implements ICommand {

	public name: string = 'ping';
	public description: string = 'Pong! O que você esperava?!';
	public usage: string[] = [ '' ];
	public category: category = category.INFORMATION;
	public aliases: string[] = [];
	public onlyOwner: boolean = false;
	public requireArgs: boolean = false;
	public args: number = 0;

	public async execute(message: Discord.Message, args: string[]) {
		let botMsg = await message.channel.send("〽️ Pinging...");
		var ping = botMsg.createdTimestamp - message.createdTimestamp + ' ms';
		await botMsg.edit(`:ping_pong: Pong! \`${ping}\``);
	}
}