const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
} = require('discord.js')

const roblox = require('noblox.js')
require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders')
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Promote',
    description: 'Promote a member in the Roblox Group.',
    data: new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Promote a member in the Roblox Group.')
    .addStringOption(option =>
        option.setName('username')
        .setDescription('User to Promote').setRequired(true)
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
            let userinfo = await db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.user.id}.robloxid`)
            let currentuser = await db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.user.id}.robloxusername`)
            if (!(currentuser || userinfo)) return interaction.editReply(`:x: **ERROR** | You aren't verified! Please verify to run this command!`)
            try {
                let groupid = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                await roblox.setCookie(await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)).catch((err) => {
                    console.log(err)
                })
                let minrank = await db.get(`ServerSetup_${interaction.guild.id}.minrank`)
                let id;
                let rank;
                try{
                id = await roblox.getIdFromUsername(username)
                rank = await roblox.getRankInGroup(groupid, id)
                } catch (error) {
                     interaction.editReply({ content: `:x: **ERROR** | **${username}** is not a Valid username! Please enter a Valid username!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                }
                if (rank === 0) {
                     interaction.editReply({ content: `:x: **ERROR** | **${username}** is not in the group. You can only rank users that are in the group!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                    )
                }
                const role = await roblox.getRole(groupid, rank)
                let newrank = role.rank + 1;
                let newrole;
                try {
                newrole = await roblox.getRole(groupid, newrank)
            } catch (error) {
                 interaction.editReply({ content: `:x: **ERROR** | ${newrank} role ID doesn't exist in the group please make sure role ID's are in order increasing by 1!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
            }

                const groupbot = (await roblox.getAuthenticatedUser()).id
                const botrank = await roblox.getRankInGroup(groupid, groupbot)
                const botrole = await roblox.getRole(groupid, botrank)
                const MaxRankbelowBot = botrole.rank - 1;
                if (role.rank === MaxRankbelowBot) {
                     interaction.editReply({ content: `:x: **ERROR** | **${username}** is at the Highest rank. You can't Promote this user!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                }
                const currentuserid = await roblox.getIdFromUsername(currentuser)
                const currentuserrank = await roblox.getRankInGroup(groupid, currentuserid)
                const currentuserrole = await roblox.getRole(groupid, currentuserrank)
                const userrunningcommand = currentuserrole.rank;
                const MinRank = minrank;
                let users = (await interaction.guild.members.fetch())
            let member_ids = users.map(m => m.user.id);
            member_ids.forEach(consoleItem)
            async function consoleItem(item, index, arr) {
                let users = await db.get(`RobloxInfo_${interaction.guild.id}_${item}.robloxusername`)
                let members = await db.get(`RobloxInfo_${interaction.guild.id}_${item}.discordid`)
                if (username == users) {
                const person = await interaction.guild.members.fetch(members)
                let findRole = newrole.name
                let findRole2 = role.name
                const role3 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole))
                const role4 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole2))
                if (!(id === userinfo) && (role.rank) > 1 && (role.rank) <= userrunningcommand){
                    if (person && role3 && role4) {
                        const rolesToAdd = [];
                        const rolesToRemove = [];
                    
                        // Collect roles to add and remove
                        if (role3) {
                            rolesToAdd.push(role3.id);
                        }
                        if (role4) {
                            rolesToRemove.push(role4.id);
                        }
                    
                        // Perform role updates
                        if (rolesToAdd.length > 0) {
                            await person.roles.add(rolesToAdd);
                        }
                        if (rolesToRemove.length > 0) {
                            await person.roles.remove(rolesToRemove);
                        }
                    }
                } else {
                    interaction.editReply({content: `Failed to Promote **${username}**\n**This message will Auto-Delete in 10 seconds!**`,}).then(
                        setTimeout(() => {
                            if (interaction) {
                          interaction.deleteReply()
                            }
                      }, 10000)
                        )
                }
                }
            }

            let avatar = await roblox.getPlayerThumbnail(id, "48x48", "png", true, "headshot");
      let avatarurl = avatar[0].imageUrl;
                if ((role.rank) > 1 && (role.rank) <= MaxRankbelowBot && userrunningcommand > MinRank && !(id === userinfo)) {
                  let embed = new EmbedBuilder()
                  .setTitle(`**Rank Management!**`)
                  .setDescription(`**Username:**\n${username}\n**UserId:**\n${id}\n**Rank Management Type:**\nPromote\n**New Rank:**\n${newrole.name}\n**Command Used By:**`)
                  .setColor('Red')
                  .setAuthor({ name: username, iconURL: avatarurl })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                roblox.promote(groupid, id)
                interaction.editReply({ content: `Successfully Promote **${username}**\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
            setTimeout(() => {
                if (interaction) {
                interaction.deleteReply()
                }
            }, 10000)
            )
                  interaction.channel.send({ embeds: [embed] }).then(message => {
                    setTimeout(() => {
                        if (message) {
                      message.delete()
                        }
                  }, 5000)
              })
        } else {
                interaction.editReply({ content: `Failed to Promote **${username}**\n**This message will Auto-Delete in 10 seconds!**`,
        }).then(
        setTimeout(() => {
            if (interaction) {
            interaction.deleteReply()
            }
        }, 10000)
        )
        }
            } catch (error) {
                console.log(error)
            }
        },
}
