const Discord = require('discord.js');
const colors = require('colors');
const config = require('./config.json');

const severity = {
    CRIT: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    VERB: 5
};

const category = {
    INFORMATION: 'Informativos',
    ADMINISTRATIVE: 'Administrativos'
}

function activityLoop(client, n) {
    client.user.setActivity(config.activities[n]);
    if (n >= config.activities.length - 1) n = -1;
    setTimeout(() => activityLoop(client, n + 1), 10000);
}

function getMention(id) {
    return `<@!${id}>`;
}

function logOnChannel(client, msg, text) {
    try {
        client.channels.fetch(config.log.channel).then(channel => {
        if (channel && channel.type === 'text') {        
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

function log(txt, src, sev) {
    const sevKey = Object.keys(severity).find(x => severity[x] === sev);
    const logText = config.log.consoleFormat
        .replace('{date}', new Date().toLocaleString(config.locale))
        .replace('{severity}', sevKey)
        .replace('{source}', src)
        .replace('{text}', txt);

    switch (sev) {
        case severity.CRIT:
            console.log(logText .bgRed.yellow);
            break;
        case severity.ERROR:
            console.log(logText .red);
            break;
        case severity.WARN:
            console.log(logText .yellow);
            break; 
        case severity.INFO:
            console.log(logText .green);
            break;   
        case severity.DEBUG:
            console.log(logText .white);
            break; 
        case severity.VERB:
            console.log(logText .gray);
            break; 
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
        (rv[keySelector(x)] = rv[keySelector(x)] || []).push(mapper(x));
        return rv;
    }, {});
};

module.exports.category = category;
module.exports.severity = severity;
module.exports.log = log;
module.exports.logOnChannel = logOnChannel;
module.exports.getMention = getMention;
module.exports.activityLoop = activityLoop;
module.exports.getRandom = getRandom;

Object.defineProperty(String.prototype, 'capitalizeFirstLetter', {
    value: function capitalizeFirstLetter() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    writable: true,
    configurable: true
});