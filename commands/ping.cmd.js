const { category } = require('../util.js');

module.exports = {
	name: 'ping',
	description: 'Pong! O que você esperava?!',
	usage: [ '' ],
	category: category.INFORMATION
};

module.exports.execute = async function(message, args) {
	let botMsg = await message.channel.send("〽️ Pinging...");
	var ping = botMsg.createdTimestamp - message.createdTimestamp + ' ms';
	await botMsg.edit(`:ping_pong: Pong! \`${ping}\``);
}