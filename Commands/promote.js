const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
} = require('discord.js')

const noblox = require('noblox.js')
require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders')

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
            let serversetup = bot.db.get(`ServerSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const username = interaction.options.getString('username');
            try {
                let groupid = bot.db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                await noblox.setCookie(bot.db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`))
                let minrank = bot.db.get(`ServerSetup_${interaction.guild.id}.minrank`)
                let userinfo = bot.db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.id}.robloxid`)
                let currentuser = bot.db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.id}.robloxusername`)
                if (!(userinfo && currentuser)) return interaction.editReply({ content: `:x: **ERROR** | You and ${username} must be Verified to run this command!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 10000)
                    )
                let id;
                let rank;
                try{
                id = await noblox.getIdFromUsername(username)
                rank = await noblox.getRankInGroup(groupid, id)
                } catch (error) {
                    return interaction.editReply({ content: `:x: **ERROR** | **${username}** is not a Valid username! Please enter a Valid username!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                }
                if (rank === 0) {
                    return interaction.editReply({ content: `:x: **ERROR** | **${username}** is not in the group. You can only rank users that are in the group!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                    )
                }
                const role = await noblox.getRole(groupid, rank)
                let newrank = role.rank + 1;
                let newrole;
                try {
                newrole = await noblox.getRole(groupid, newrank)
            } catch (error) {
                return interaction.editReply({ content: `:x: **ERROR** | **${username}** is at the Highest rank. You can't Promote this user!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
            }
                const groupbot = await noblox.getCurrentUser("UserID")
                const botrank = await noblox.getRankInGroup(groupid, groupbot)
                const botrole = await noblox.getRole(groupid, botrank)
                const MaxRankbelowBot = botrole.rank - 1;
                if (role.rank === MaxRankbelowBot) {
                    return interaction.editReply({ content: `:x: **ERROR** | **${username}** is at the Highest rank. You can't Promote this user!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                }
                const currentuserid = await noblox.getIdFromUsername(currentuser)
                const currentuserrank = await noblox.getRankInGroup(groupid, currentuserid)
                const currentuserrole = await noblox.getRole(groupid, currentuserrank)
                const userrunningcommand = currentuserrole.rank;
                const MinRank = minrank;
                let users = (await interaction.guild.members.fetch())
            let member_ids = users.map(m => m.user.id);
            member_ids.forEach(consoleItem)
            async function consoleItem(item, index, arr) {
                let users = bot.db.get(`RobloxInfo_${interaction.guild.id}_${item}.robloxusername`)
                let members = bot.db.get(`RobloxInfo_${interaction.guild.id}_${item}.discordid`)
                if (username == users) {
                const person = await interaction.guild.members.fetch(members)
                let findRole = newrole.name
                let findRole2 = role.name
                const role3 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole))
                const role4 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole2))
                if (!(id === userinfo) && (role.rank) <= MaxRankbelowBot && (role.rank) <= userrunningcommand) {
                    if (role3 && role4) {
                await person.roles.add(role3.id);
                await person.roles.remove(role4.id);
                    }
                } else {
                    interaction.editReply({content: `:x: **ERROR** | Failed to Promote **${username}**\n**This message will Auto-Delete in 10 seconds!**`,}).then(
                        setTimeout(() => {
                          interaction.deleteReply().catch(() => {
                            return;
                          })
                      }, 10000)
                        )
                }
                }
            }
                let group = await noblox.getGroup(groupid);
                let groupName = group.name;
                let groupOwner = group.owner.username;
              let avatar = await noblox.getPlayerThumbnail(id, "48x48", "png", true, "headshot");
                let avatarurl = avatar[0].imageUrl;
                if ((role.rank) >= 1 && (role.rank) < MaxRankbelowBot && userrunningcommand > MinRank && !(id === userinfo)) {
                  let embed = new EmbedBuilder()
                  .setTitle(`**Rank Management!**`)
                  .setDescription(`**Username:**\n${username}\n**UserId:**\n${id}\n**Rank Management Type:**\nPromote\n**New Rank:**\n${newrole.name}\n**Command Used By:**`)
                  .setColor('Green')
                  .setAuthor({ name: username, iconURL: avatarurl })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                  noblox.message(id, `${groupName} Promotion`, `Hello ${username}, You have been Promoted in ${groupName} to ${newrole.name} from ${role.name}! If you have any questions please contact ${groupOwner} or the Co-Owners of the Group.`).catch((err) => {
                    console.log(err.message)
                  })
                noblox.promote(groupid, id)
                interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully Promoted **${username}**\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
            setTimeout(() => {
                interaction.deleteReply().catch(() => {
                    return;
                  })
            }, 10000)
            )
                  interaction.channel.send({ embeds: [embed] }).then(message => {
                    setTimeout(() => {
                      message.delete().catch(() => {
                        return;
                      })
                  }, 5000)
              })
        } else {
                interaction.editReply({ content: `:x: **ERROR** | Failed to Promote **${username}**\n**This message will Auto-Delete in 10 seconds!**`,
        }).then(
        setTimeout(() => {
            interaction.deleteReply().catch(() => {
                return;
              })
        }, 10000)
        )
        }
            } catch (error) {
                console.log(error)
                interaction.editReply({ content: `:x: **ERROR** | Failed to Promote **${username}**\n**This message will Auto-Delete in 10 seconds!**`,
        }).then(
            setTimeout(() => {
              interaction.deleteReply().catch(() => {
                return;
              })
          }, 10000)
            )
            }
        },
}
