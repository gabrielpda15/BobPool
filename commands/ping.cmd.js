const { prefix } = require('../config.json');
const { category } = require('../util.js');

module.exports = {
	name: 'ping',
	description: 'Ping!',
	category: category.INFORMATION
};

module.exports.execute = async function(message, args) {
	let botMsg = await message.channel.send("〽️ Pinging...");
	var ping = '`' + (botMsg.createdTimestamp - message.createdTimestamp) + ' ms`';
	botMsg.edit(`:ping_pong: Pong! ${ping}`);
}