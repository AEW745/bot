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
const db = require('quick.db');
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'Unverify',
    description: 'Unverifies a member in the Roblox Group.',
    data: new SlashCommandBuilder()
    .setName('unverify')
    .setDescription('Unverifies a member in the Roblox Group.')
    .addStringOption(option =>
        option.setName('username')
        .setDescription('What is your Roblox Username?').setRequired(true)
        .setAutocomplete(true)
        ),

        /**
         * 
         * @param {Client} bot
         * @param {CommandInteraction} interaction
         */
        async slashexecute(bot, interaction) {
            let serversetup = bot.db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const username = interaction.options.getString('username');
            try {
                let id;
                let rank;
                let role1;
                try {
                    let groupid = bot.db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                    await noblox.setCookie(bot.db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`))
                    id = await noblox.getIdFromUsername(username)
                    rank = await noblox.getRankInGroup(groupid, id)
                    role1 = await noblox.getRole(groupid, rank)
                } catch (error) {
                    return interaction.editReply({ content: `**${username}** is not a Valid username! Please enter a Valid username!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                    )
                }
                if (username) {
                 await interaction.editReply({ content: `:white_check_mark: **SUCCESS** | You have been successfully unverified and your Roles have been removed!\n**This message will Auto-Delete in 5 seconds!**` }).then(
                 
                    setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 5000)
                 )
                 bot.db.delete(`RobloxInfo_${interaction.guild.id}_${interaction.member.id}`)
                 bot.db.delete(`Verification_${interaction.guild.id}_${interaction.member.id}_${id}`)
                 const member = await interaction.guild.members.fetch(interaction.member.id)
                let findRole = "Verified"
                let findRole2 = role1.name
                const role = await interaction.guild.roles.cache.find(r => r.name.includes(findRole))
                const role2 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole2))
                if (member && role && role2) {
                await member.roles.remove(role.id);
                await member.roles.remove(role2.id);
                }
                
                } else {
                    await interaction.editReply({ content: `:x: **ERROR** | Failed to unverify your account! Please try again later!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                    )
                }

            } catch (err) {
                console.log(err.message)
            }
        }
    }
