const { prefix } = require('../config.json');
const { category } = require('../util.js');

module.exports = {
	name: 'status',
	description: 'Deixa o bot invisivel ou online.',
    usage: [ '[inv|online]' ],
    onlyOwner: true,
    requireArgs: true,
    args: 1,
    category: category.INFORMATION
};

module.exports.execute = async function(message, args) {
    switch (args[0]) {
        case 'inv':
            message.client.user.setStatus('invisible');
            message.channel.send('Pronto! Agora estou invisivel!');
            break;
        case 'online':
            message.client.user.setStatus('online');
            message.channel.send('Pronto! Agora estou online!');
            break;
        default:
            message.channel.send(`Opção inválida! Tente usar \`${prefix}${this.name}\``);
            break;
    }   
}