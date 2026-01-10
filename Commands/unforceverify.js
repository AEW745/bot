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
    name: 'Unforceverify',
    description: 'Removes Verification from a member in the Roblox Group.',
    data: new SlashCommandBuilder()
    .setName('unforceverify')
    .setDescription('Removes Verification from a member in the Roblox Group.')
    .addStringOption(option =>
        option.setName('username')
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
            const discorduser = interaction.options.getUser('discordusername');
        const member = await interaction.guild.members.fetch(discorduser.id);
            try {
                let groupid = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                await roblox.setCookie(await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)).catch((err) => {
                    console.log(err)
                })
                let id;
            let rank;
            try {
            id = await roblox.getIdFromUsername(username)
            rank = await roblox.getRankInGroup(groupid, id)
            } catch (error) {
                return interaction.editReply({ content: `**${username}** is not a Valid username! Please enter a Valid username!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 10000)
                )
            }
        const role1 = await roblox.getRole(groupid, rank);
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
                    await db.delete(`RobloxInfo_${interaction.guild.id}_${member.user.id}`)
                    await db.delete(`Verification_${interaction.guild.id}_${id}`);
                    interaction.channel.send({ embeds: [embed4]}).then(message => {
                        setTimeout(() => {
                          message.delete().catch(() => {
                            return;
                          })
                      }, 5000)
                })
                let findRole = "Verified"
                let findRole2 = role1.name
                const role = interaction.guild.roles.cache.find(r => r.name.includes(findRole))
                const role2 = interaction.guild.roles.cache.find(r => r.name.includes(findRole2))
                const botHighestRole = interaction.guild.members.me.roles.highest;
                if (member && (role || role2)) {
                  const rolesToRemove = [];
              
                  // Check if the member has the roles
                  if (member.roles.cache.has(role.id) && role.position < botHighestRole.position) {
                      rolesToRemove.push(role.id);
                  }
              
                  if (role2) {
                  if (member.roles.cache.has(role2.id) && role2.position < botHighestRole.position) {
                      rolesToRemove.push(role2.id);
                  }
                }
              
                  // Remove roles if there are any to remove
                  if (rolesToRemove.length > 0) {
                      await member.roles.remove(rolesToRemove);
                  }
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
                console.log(err)
            }
        }
    }
