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
            let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`**:x: ERROR** | This a ROBLOX Command. Roblox Commands haven't been setup! Please ask the Owner to setup the bot for Roblox Commands!`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
            )
            const username = interaction.options.getString('username');
            try {
                let id;
                let rank;
                let role1;
                try {
                    let groupid = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                    await noblox.setCookie(await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)).catch((err) => {
                        console.log(err)
                    })
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
                 await db.delete(`RobloxInfo_${interaction.guild.id}_${interaction.member.user.id}`)
                 await db.delete(`Verification_${interaction.guild.id}_${id}`)
                
                let findRole = "Verified"
                let findRole2 = role1.name
                const role = await interaction.guild.roles.cache.find(r => r.name.includes(findRole))
                const role2 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole2))
                const botHighestRole = interaction.guild.members.me.roles.highest;

                if (interaction.member && role && role2) {
                    const rolesToRemove = [];
                
                    // Check if the member has the roles
                    if (interaction.member.roles.cache.has(role.id) && role.position < botHighestRole.position) {
                        rolesToRemove.push(role.id);
                    }
                
                    if (role2) {
                    if (interaction.member.roles.cache.has(role2.id) && role2.position < botHighestRole.position) {
                        rolesToRemove.push(role2.id);
                    }
                } else {
            interaction.editReply(`Please join the Roblox group to remove group role! I was only able to remove the Verified Role for now!`)
        }
                
                    // Remove roles if there are any to remove
                    if (rolesToRemove.length > 0) {
                        await interaction.member.roles.remove(rolesToRemove);
                    }
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
                console.log(err)
            }
        }
    }
