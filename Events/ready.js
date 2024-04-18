const { Client } = require('discord.js')
const noblox = require('noblox.js')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v10')
require('dotenv').config();

const rest = new REST({version: '10'}).setToken(process.env.Token)

/**
 * 
 * @param {Client} bot 
 */
module.exports.execute = async (bot) => {

  bot.on('guildCreate', async (guild) => {
    console.log(`Joined guild: ${guild.name}`);
    bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
    // Refresh slash commands for the newly joined guild
    try {
      console.log('Started Refreshing Slash Commands');
      await rest.put(Routes.applicationGuildCommands(bot.user.id, guild.id), {
        body: bot.slashcommands,
      });
      console.log('Refreshed Slash Commands');
    } catch (error) {
      console.error(error);
    }
  });

  bot.on('guildDelete', async (guild) => {
    console.log(`Left guild: ${guild.name}`);
    bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
    // Refresh slash commands for the newly joined guild
    try {
      console.log('Started Refreshing Slash Commands');
      await rest.put(Routes.applicationGuildCommands(bot.user.id, guild.id), {
        body: bot.slashcommands,
      });
      console.log('Refreshed Slash Commands');
    } catch (error) {
      console.error(error);
    }
  });
    //bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
    bot.guilds.cache.forEach(async (serverids) => {
      console.log(`Joined guild: ${serverids.name}`);
      bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers!`, type: 3 }], status: 'dnd'})
      // Refresh slash commands for the newly joined guild
      try {
        console.log('Started Refreshing Slash Commands');
        await rest.put(Routes.applicationGuildCommands(bot.user.id, serverids.id), {
          body: bot.slashcommands,
        });
        
        console.log('Refreshed Slash Commands');
      } catch (error) {
        console.error(error);
      }
        })
 }
