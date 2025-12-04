const { Client, Guild, ActivityType } = require('discord.js');

const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v10')

require('dotenv').config();

const rest = new REST({version: '10'}).setToken(process.env.Token)
/**
 * 
 * @param {Client} bot
 * @param {Guild} guild
 */
module.exports.execute = async (bot, guild) => {
    console.log(`Joined guild: ${guild.name}`);
    bot.user.setPresence({ activities: [{ name: `Watching ${bot.guilds.cache.size} servers!`, type: ActivityType.Watching }], status: 'dnd'})

    try {
        console.log('Started Refreshing Slash Commands');
        await rest.put(Routes.applicationCommands(bot.user.id), {
            body: bot.slashcommands,
        });
        console.log('Refreshed Slash Commands');
    } catch (error) {
        console.error(error);
    }
}