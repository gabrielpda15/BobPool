const Discord = require('discord.js');
const config = require('./config.json');

function activityLoop(client, n) {
    client.user.setActivity(config.activities[n]);
    if (n >= config.activities.length - 1) n = -1;
    setTimeout(() => activityLoop(client, n + 1), 10000);
}

function getMention(id) {
    return `<@!${id}>`;
}

function log(client, msg, text) {
    try {
        client.channels.fetch(config.log.channel).then(channel => {
        if (channel?.type === 'text') {        
            const logText = config.log.format
            .replace('{date}', new Date().toLocaleString(config.locale))
            .replace('{channel}', msg.channel.name)
            .replace('{channelMention}', getMention(msg.channel.id))
            .replace('{channel:1}', msg.channel.name.substr(1))
            .replace('{channel:2}', msg.channel.name.substr(2))
            .replace('{channel:3}', msg.channel.name.substr(3))
            .replace('{author}', `${msg.author.username}#${msg.author.discriminator}`)
            .replace('{authorMention}', getMention(msg.author.id))
            .replace('{text}', text);
                        
            channel.send(logText);
        }
        });
    } catch (error) {
        console.log(`Unable to log to discord chat ${config.log.channel}`);
    } 
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

module.exports.createEmbed = function(title, desc) {
    let embed = new Discord.MessageEmbed();
    if (title) embed = embed.setTitle(title);
    if (desc) embed = embed.setDescription(desc);

    let colors = ['#00B02F', '#2800C9', '#BF0C00', '#A400C9', '#DB7900', '#FFEE00'];

    if (Array.isArray(config.embedColor)) colors = config.embedColor;

    if (config.embedColor === 'random' || Array.isArray(config.embedColor)) {
        embed = embed.setColor(colors[getRandom(0, colors.length)]);
    } else if (config.embedColor.startsWith('#') && config.embedColor.length == 7) {
        embed = embed.setColor(config.embedColor);
    }

    return embed;
}

module.exports.groupBy = function(xs, keySelector, mapper) {
    return xs.reduce((rv, x) => {
        const index = rv.findIndex(y => y.key === keySelector(x));
        if (index == -1) {
            rv.push({key: keySelector(x), values: [ mapper(x) ]});
        } else {
            rv[index].values.push(mapper(x));
        }
        return rv;
    }, []);
};

module.exports.category = {
    INFORMATION: 'Informativos',
    ADMINISTRATIVE: 'Administrativos'
}

module.exports.log = log;
module.exports.getMention = getMention;
module.exports.activityLoop = activityLoop;
module.exports.getRandom = getRandom;