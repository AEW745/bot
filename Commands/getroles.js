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
    name: 'Getroles',
    description: 'Gets your roles from the Roblox Group.',
    data: new SlashCommandBuilder()
    .setName('getroles')
    .setDescription('Gets your roles from the Roblox Group.'),

        /**
         * 
         * @param {Client} bot
         * @param {CommandInteraction} interaction
         */
        async slashexecute(bot, interaction) {
            let serversetup = bot.db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const username = bot.db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.id}.robloxusername`);
            const discorduser = bot.db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.id}.discordid`);
        const member = await interaction.guild.members.fetch(discorduser);
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
                    return interaction.editReply({ content: `I can't get Roles for unverified users. Please use the **/verify** command and run this command again!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        if (interaction) {
                        interaction.deleteReply()
                        }
                    }, 10000)
                    )
                }
                if (username && discorduser) {
                 let findRole = "Verified"
                 let findRole2 = role1.name
                 const role = await interaction.guild.roles.cache.find(r => r.name.includes(findRole))
                 const role2 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole2))
                 try {
                if (id && rank && role1) {
                 await member.roles.set([role.id, role2.id]);
                }
                 } catch (error) {
                    return interaction.editReply({ content: `I don't have permission to update roles for **${username}**\n**This message will Auto-Delete in 10 seconds!**`}).then(
                        setTimeout(() => {
                            if (interaction) {
                            interaction.deleteReply()
                            }
                        }, 10000)
                    )
                 }
                 interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully updated roles for ${username}\n**This message will Auto-Delete in 10 seconds!**` }).then(
                 setTimeout(() => {
                    if (interaction) {
                    interaction.deleteReply()
                    }
                }, 10000)
                 )
                } else {
                  await  interaction.editReply({ content: `:x: **ERROR** | Failed to update roles for ${username}\n**This message will Auto-Delete in 10 seconds!**` }).then(
                  setTimeout(() => {
                    if (interaction) {
                    interaction.deleteReply()
                    }
                }, 10000)
                  )
                }

            } catch (err) {
                console.log(err.message)
            }
        }
    }
