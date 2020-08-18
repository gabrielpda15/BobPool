import * as Discord from 'discord.js';
import { category } from "./util";

export interface ICommand {
    name: string;
	description: string;
    aliases: string[];
    usage: string[];    
    onlyOwner: boolean;
    requireArgs: boolean;
    args: number;
    category: category;

    execute(message: Discord.Message, args: string[]): Promise<any>;
}