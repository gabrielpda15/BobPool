const Discord = require('discord.js');
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
                    command.usage.map(x => x != '' ? `\`${process.env.prefix}${command.name} ${x}\`` : `\`${process.env.prefix}${command.name}\``).join('\n'));
            }
            await message.channel.send(embed);
        } else {
            await message.channel.send(`Desculpe não conheço o comando \`${args[0]}\`!`);
        }
        return;
    }

    embed = createEmbed('Todos os Comandos', 
        `Utilize \`${process.env.prefix}help <nome do comando>\` para obter ajuda mais detalhada!`);

    let result = groupBy(message.client.commands, x => x.category, x => `\`${x.name}\``);

    for (let key in category) {   
        const value = result[category[key]];
        if (value) embed.addField(category[key], value.join(', '));
    }

    await message.channel.send(embed);
}