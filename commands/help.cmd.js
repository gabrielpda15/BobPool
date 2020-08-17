const Discord = require('discord.js');
const { prefix } = require('../config.json');
const { groupBy, category, createEmbed, logOnChannel: log } = require('../util.js');
const utils = require('../util.js');

module.exports = {
	name: 'help',
	description: 'Lista todos os comandos ou obtem ajuda de um comando especifico.',
	aliases: ['commands'],
    usage: [ '', '<nome do comando>'],
    category: category.INFORMATION
};

module.exports.execute = async function(message, args) {
    let embed = new Discord.MessageEmbed();
    
    if (args && args.length > 0) {
        const command = message.client.findCommand(args[0]);
        if (command) {
            embed = createEmbed(`Comando: ${command.name.capitalizeFirstLetter()}`, command.description);
            if (command.aliases) embed = embed.addField('Atalhos', command.aliases.map(x => `\`${x}\``).join(', '));
            if (command.usage) {
                let title = 'Uso';
                if (command.usage.length > 1) title = 'Usos';
                embed = embed.addField(title, 
                    command.usage.map(x => x != '' ? `\`${prefix}${command.name} ${x}\`` : `\`${prefix}${command.name}\``).join('\n'));
            }
            message.reply(embed);
        } else {
            message.reply(`Desculpe não conheço o comando \`${args[0]}\`!`);
        }
        return;
    }

    embed = createEmbed('Todos os Comandos', 
        `Utilize \`${prefix}help <nome do comando>\` para obter ajuda mais detalhada!`);

    let result = groupBy(message.client.commands, x => x.category, x => `\`${x.name}\``);

    for (let key in category) {   
        const desc = result[category[key]]?.join(', ');
        if (desc) embed.addField(category[key], desc);
    }

    message.channel.send(embed);
}