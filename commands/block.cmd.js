const { adminConfig } = require('../config.json');
const { category } = require('../util.js');

module.exports = {
	name: 'block',
	description: 'Remove todos os cargos e bloqueia o usuario de todos os chats.',
    usage: [ '[menção do usuário]' ],
    requireArgs: true,
    args: 1,
    category: category.ADMINISTRATIVE
};

module.exports.execute = async function(message, args) {
    const target = message.mentions.members.first();
    const blockedRole = message.guild.roles.cache.get(adminConfig.blockedRole);

    if (!target) {
        await message.reply(`tenha certeza que você mencionou um usuário no comando!`);
        return;
    }

    if (target.permissions.has('KICK_MEMBERS')) {
        await message.reply(`não é possivel bloquear ${target} pois possui direitos de moderação!`);
        return;
    }

    let msg = await message.channel.send(`Removendo cargo de ${target}...`);

    for (let role of target.roles.cache.values()) {
        if (role.id !== message.guild.roles.everyone.id)
            await target.roles.remove(role);
    }

    await msg.edit(`Bloqueando ${target}...`);

    target.roles.add(blockedRole);
    
    await msg.edit(`${target} foi bloqueado com sucesso!`);
}