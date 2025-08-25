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

const noblox = require('noblox.js')
require('dotenv').config();
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'Setnick',
    description: 'Lets you change your nickname format',
    data: new SlashCommandBuilder()
    .setName('setnick')
    .setDescription('Changes your nickname format')
    .addStringOption(option =>
        option.setName('username')
        .setDescription('What is your Roblox Username?').setRequired(true)
        .setAutocomplete(true)
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
            if (nickname.length > 32) return interaction.editReply(`:x: **ERROR** | Your nickname is too long! Please choose Username or Displayname format!`)
            try {
                if (!interaction.member.manageable) return interaction.editReply(`:x: **ERROR** | Unable to change your nickname. I can't change your nickname if you are a higher rank than me.\n**This message will Auto-Delete in 5 seconds!**`).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 5000)
              )
                interaction.member.setNickname(nickname)
                interaction.editReply(`:white_check_mark: **SUCCESS** | I have successfully updated your nickname!\n**This message will Auto-Delete in 5 seconds!**`).then(
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
