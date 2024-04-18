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
    name: 'Unforceverify',
    description: 'Removes Verification from a member in the Roblox Group.',
    data: new SlashCommandBuilder()
    .setName('unforceverify')
    .setDescription('Removes Verification from a member in the Roblox Group.')
    .addStringOption(option =>
        option.setName('rblxusername')
        .setDescription('What is their Roblox Username?').setRequired(true)
        .setAutocomplete(true)
        )
    .addUserOption(option =>
        option.setName('discordusername')
        .setDescription('What is their Discord Username?').setRequired(true)
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
            const username = interaction.options.getString('rblxusername');
            const discorduser = interaction.options.getUser('discordusername');
        const member = await interaction.guild.members.fetch(discorduser.id);
            try {
                let groupid = bot.db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                await noblox.setCookie(bot.db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`))
                let id;
            let rank;
            try {
            id = await noblox.getIdFromUsername(username)
            rank = await noblox.getRankInGroup(groupid, id)
            } catch (error) {
                return interaction.editReply({ content: `**${username}** is not a Valid username! Please enter a Valid username!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 10000)
                )
            }
        const role1 = await noblox.getRole(groupid, rank);
                if (username) {
                    interaction.editReply({ content: `:white_check_mark: **SUCCESS** | You have successfully removed verification from ${username}\n**This message will Auto-Delete in 10 seconds!**` }).then(
                        setTimeout(() => {
                           interaction.deleteReply().catch(() => {
                            return;
                          })
                       }, 10000)
                        )
                    let embed4 = new EmbedBuilder()
                    .setTitle('**Money Devs Verification!**')
                    .setColor('Green')
                    .setDescription(`Verification has been removed from ${username}`)
                    .setFooter({ text: `They will need to verify again! | This message will Auto-Delete in 5 seconds!`, })
                    .setTimestamp(Date.now())
                    console.log(member.id)
                    bot.db.delete(`RobloxInfo_${interaction.guild.id}_${member.id}`)
                    bot.db.delete(`Verification_${interaction.guild.id}_${member.id}_${id}`);
                    interaction.channel.send({ embeds: [embed4]}).then(message => {
                        setTimeout(() => {
                          message.delete().catch(() => {
                            return;
                          })
                      }, 5000)
                })
                 let findRole = "Verified"
                 let findRole2 = role1.name
                 const role = await interaction.guild.roles.cache.find(r => r.name.includes(findRole))
                 const role2 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole2))
                 if (member && role && role2) {
                 await member.roles.remove(role.id);
                 await member.roles.remove(role2.id);
                 }
                 
                } else {
                    interaction.editReply({ content: `:x: **ERROR** | Failed to un-force verify ${username}\n**This message will Auto-Delete in 10 seconds!**`}).then(
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
