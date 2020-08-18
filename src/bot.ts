import * as Discord from 'discord.js';
import { Observable } from 'rxjs';
import { ICommand } from './command';
import { EventEmitter } from 'events';

export class Bot extends Discord.Client {

    public commands: Discord.Collection<string, ICommand>;
    // public reactionHandler: ReactionEventEmitter;
    private importedFiles: string[];

    constructor(options?: Discord.ClientOptions) {
        super(options);

        this.importedFiles = [];
        // this.reactionHandler = new ReactionEventEmitter();
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
                });
            }            
        }        
    }
}

/*
export declare interface ReactionEventEmitter {
    on(event: 'addReaction', listener: (reaction: Discord.ReactionEmoji, user: Discord.User | Discord.PartialUser) => Promise<any>): this;
    on(event: string, listener: Function): this;
}

export class ReactionEventEmitter extends EventEmitter {
    
}
*/