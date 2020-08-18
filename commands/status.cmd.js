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
            await message.client.user.setStatus('invisible');
            await message.channel.send('Pronto! Agora estou invisivel!');
            break;
        case 'online':
            await message.client.user.setStatus('online');
            await message.channel.send('Pronto! Agora estou online!');
            break;
        default:
            await message.channel.send(`Opção inválida! Tente usar \`${process.env.prefix}${this.name}\``);
            break;
    }   
}