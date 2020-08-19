import * as Discord from 'discord.js';
import { ICommand } from './command';
import { log, severity } from './util';

export class Bot extends Discord.Client {

    public commands: Discord.Collection<string, ICommand>;
    private importedFiles: string[];

    constructor(options?: Discord.ClientOptions) {
        super(options);

        this.importedFiles = [];
        this.commands = new Discord.Collection<string, ICommand>();
    }

    public findCommand(value: string) {
        return this.commands.get(value) || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(value));
    }

    public importCommands(files: string[]) {
        for (let file of files) {
            if (!this.importedFiles.includes(file)) {
                import(`./commands/${file}`).then(c => {
                    if (c.default && c.default instanceof Function) {
                        const cmd: ICommand = new c.default;
                        this.commands.set(cmd.name, cmd);
                    }
                }).catch(error => log(error, 'CMD_IMPORT', severity.ERROR));
            }            
        }
        log(`Loaded ${this.commands.size} commands!`, 'CMD_IMPORT', severity.INFO);    
    }
}