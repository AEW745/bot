const {
    Client,
    Message,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    User,
    Guild,
    Events,
    PermissionsBitField,
} = require('discord.js')

const roblox = require('noblox.js')
require('dotenv').config();
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'Setup',
    description: 'Setup the bot for your Discord Server.',
    data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup the bot for your Discord Server.'),

        /**
         * 
         * @param {Client} bot
         * @param {CommandInteraction} interaction
         */
        async slashexecute(bot, interaction) {
            try {

                await interaction.deferReply({ephemeral: true})

                bot.application.fetch().then(async application => {

  const isBotOwner = interaction.member.id === application.owner.ownerId;
  const isGuildOwner = interaction.member.id === interaction.guild.ownerId;
    if (!(isGuildOwner || isBotOwner)) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!`)
        const embed = new EmbedBuilder()
        .setTitle(`Setup Server!`)
        .setAuthor({ name: interaction.guild.name })
        .setDescription(`This is the server setup menu. Please click the Setup Server button. (Adding Logs are optional.)\n\n**Make Sure you use the (/download) command to download all the Games that come with the bot!**`)
        .setColor(`Yellow`)
        interaction.editReply({ embeds: [embed], components: [ new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId('serversetup').setLabel('Setup Server').setEmoji('⚙️').setStyle(ButtonStyle.Success)).addComponents( new ButtonBuilder().setCustomId('setuplogs').setLabel('Setup Logs').setEmoji('📓').setStyle(ButtonStyle.Success)) ], ephemeral: true });
                })
    } catch (err) {
                console.log(err)
            }
            
        }
    }
