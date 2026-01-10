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
    name: 'Forcenick',
    description: `Lets you change another user's nickname format`,
    data: new SlashCommandBuilder()
    .setName('forcenick')
    .setDescription(`Changes another user's nickname format`)
    .addStringOption(option =>
        option.setName('username')
        .setDescription(`What is the user's Roblox Username?`).setRequired(true)
        .setAutocomplete(true)
        )
    .addUserOption(option =>
        option.setName('discordusername')
        .setDescription('What is their Discord Username?').setRequired(true)
        )
    .addStringOption(option =>
        option.setName('nickname')
        .setDescription('Choose a username format').setRequired(true)
        .setAutocomplete(true)
        ),

        /**
         * 
         * @param {Client} bot
         * @param {CommandInteraction} interaction
         */
        async slashexecute(bot, interaction) {
            let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`**:x: ERROR** | This a ROBLOX Command. Roblox Commands haven't been setup! Please ask the Owner to setup the bot for Roblox Commands!`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
            )
            const nickname = interaction.options.getString('nickname')
            const discorduser = interaction.options.getUser('discordusername');
            const member = await interaction.guild.members.fetch(discorduser.id);
            if (nickname.length > 32) return interaction.editReply(`:x: **ERROR** | Their nickname is too long! Please choose Username or Displayname format!`)
            try {
                if (!member) return interaction.editReply(`:x: **ERROR** | I was unable to find this user. Please make sure this user is in the server and the user is valid!\n**This message will Auto-Delete in 5 seconds!**`).then(
                    setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                            })
                    }, 5000)
                )
                if (!member.manageable) return interaction.editReply(`:x: **ERROR** | Unable to change user's nickname. I can't change this user's nickname if they are a higher rank than me.\n**This message will Auto-Delete in 5 seconds!**`).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 5000)
              )
                member.setNickname(nickname)
                interaction.editReply(`:white_check_mark: **SUCCESS** | I have successfully updated user's nickname!\n**This message will Auto-Delete in 5 seconds!**`).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 5000)
                )

            } catch (err) {
                console.log(err)
            }
        }
    }
