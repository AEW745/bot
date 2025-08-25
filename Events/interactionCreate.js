const { WebhookClient, Client, ActionRowBuilder, EmbedBuilder, ButtonBuilder, PermissionsBitField, TextInputBuilder,  TextInputStyle, InteractionType, ModalBuilder, MessageFlags, ButtonStyle } = require('discord.js')
const {QuickDB} = require('quick.db')
const db = new QuickDB();
const noblox = require('noblox.js')
const fetch = require('fetch')

/**
 * 
 * @param {Client} bot
 * @param {Interaction} interaction
 */

module.exports.execute = async(bot, interaction) => {
      if (!interaction.isCommand()) return
    const command = interaction.commandName

    if (!bot.commands.has(command)) return
    
    bot.commands.get(command).slashexecute(bot, interaction)
}