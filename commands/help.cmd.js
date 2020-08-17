const Discord = require('discord.js');
const { prefix } = require('../config.json');
const { groupBy, category, createEmbed } = require('../util.js');

module.exports = {
	name: 'help',
	description: 'Lista todos os comandos ou obtem ajuda de um comando especifico.',
	aliases: ['commands'],
    usage: '<nome do comando>',
    category: category.INFORMATION
};

module.exports.execute = async function(message, args) {
    const data = [];

    let embed = createEmbed('Todos os Comandos', 
        'Utilize `' + `${prefix}help <nome do comando>` + '` para obter ajuda mais detalhada!');

    let result = groupBy(message.client.commands, x => x.category, x => '`' + x.name + '`');

    for (let key in category) {            
        const desc = result.find(x => x.key === category[key])?.values.join(', ');
        if (desc) embed.addField(category[key], desc);
    }

    message.channel.send(embed);
}