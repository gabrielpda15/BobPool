import { Program } from './main';
import { log, severity } from './util';
import { Bot } from './bot';
import { Intents, IntentsString } from 'discord.js';

let intents: number = null;

for (let item in Intents.FLAGS) {
    if (item != 'GUILD_PRESENCES' && item != 'GUILD_MEMBERS') {
        if (intents == null) intents = Intents.FLAGS[<IntentsString>item];
        else intents = intents | Intents.FLAGS[<IntentsString>item];
    }
}

export const client = new Bot({ intents: intents });
const program = new Program();
program.addListeners();
program.start().catch(error => log(error, 'PROGRAM', severity.ERROR));