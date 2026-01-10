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
    name: 'Level',
    description: 'Check your level, XP, and XP needed',
    data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Check your level, XP, and XP needed'),

        /**
         * 
         * @param {Client} bot
         * @param {CommandInteraction} interaction
         */
        async slashexecute(bot, interaction) {
            //let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply();
            /*if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`).then(
              setTimeout(() => {
                  interaction.deleteReply().catch(() => {
                      return;
                  })
              }, 10000)
          )*/
            let level = await db.get(`Levels_${interaction.guild.id}_${interaction.member.user.id}.level`)
            let xp = await db.get(`Levels_${interaction.guild.id}_${interaction.member.user.id}.xp`)
            let NeededXP = level * level * 100
            try {
              if (await db.get(`Levels_${interaction.guild.id}_${interaction.member.user.id}`)) {
                interaction.editReply(`${interaction.member.user}, you currently have **${xp} XP** and you are at **level ${level}!** You will need **${NeededXP} XP** to level up to **level ${level + 1}!**`).then(() => {
                  setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                      return;
                    })
                  }, 10000)
                })
                } else {
                  interaction.editReply(`:x: **ERROR** | ${interaction.member.user}, you currently don't have any data for levels! **To create data start chatting!**`).then(() => {
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                    }, 10000)
                  })
                }
            } catch (err) {
                console.log(err)
            }
        }
    }