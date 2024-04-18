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
    name: 'Rank',
    description: 'Rank a member in the Roblox Group.',
    data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Rank a member in the Roblox Group.')
    .addStringOption(option =>
        option.setName('username')
        .setDescription('User to Rank').setRequired(true)
        .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('rank')
            .setDescription('Rank a Member').setRequired(true)
            .setAutocomplete(true)
            ),
        /**
         * 
         * @param {Client} bot
         * @param {Message} message
         * @param {String[]} args
         */
        async execute(bot, message, args) {},

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
            const ranks = interaction.options.getString('rank');
            let userinfo = bot.db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.id}.robloxid`);
            let currentuser = bot.db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.id}.robloxusername`);
            try {
                let groupid = bot.db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                await noblox.setCookie(bot.db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`))
                let minrank = bot.db.get(`ServerSetup_${interaction.guild.id}.minrank`)
                if (!(currentuser && userinfo)) return interaction.editReply({ content: `:x: **ERROR** | You must be Verified to run this command!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                      })
                }, 10000)
                )
                const currentuserid = await noblox.getIdFromUsername(currentuser)
                const currentuserrank = await noblox.getRankInGroup(groupid, currentuserid)
                const currentuserrole = await noblox.getRole(groupid, currentuserrank)
                const userrunningcommand = currentuserrole.rank;
                const MinRank = minrank;
                let getRole;
                try {
                getRole = await noblox.getRole(groupid, ranks)
                } catch (error) {
                    return interaction.editReply({ content: `**${ranks}** is not a Valid rank! Please choose a rank from the options.\n**This message will Auto-Delete in 10 seconds!**`}).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                        )
                }
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
                if (rank === 0) {
                    return interaction.editReply({ content: `**${username}** is not in the group. You can only rank users that are in the group!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                    )
                }

                if (rank === getRole.rank) {
                    return interaction.editReply({ content: `**${username}** is already ${ranks}. Please try a different rank!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                    )
                }
                const role = await noblox.getRole(groupid, rank)
                const groupbot = await noblox.getCurrentUser("UserID")
                const botrank = await noblox.getRankInGroup(groupid, groupbot)
                const botrole = await noblox.getRole(groupid, botrank)
                const MaxRankbelowBot = botrole.rank - 1;
                let users = (await interaction.guild.members.fetch())
            let member_ids = users.map(m => m.user.id);
            member_ids.forEach(consoleItem)
            async function consoleItem(item, index, arr) {
                if (!(bot.db.get(`RobloxInfo_${interaction.guild.id}_${item}.robloxusername`).includes(username))) return;
                let members = bot.db.get(`RobloxInfo_${interaction.guild.id}_${item}.discordid`)
                if ((role.rank) <= MaxRankbelowBot && (role.rank) >= 1 && userrunningcommand > MinRank && (getRole.rank) >= 1 && (getRole.rank) !== role.rank && !(id === userinfo)) {
                const person = await interaction.guild.members.fetch(members)
                console.log(person)
                    let findRole = ranks
                    let findRole3 = "Verified"
                    let findRole4 = "Server Booster"
                    const role3 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole))
                    console.log(role3)
                    const role4 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole3))
                    const role5 = await interaction.guild.roles.cache.find(r => r.name.includes(findRole4))
                if (person.roles.cache.has(role5.id)) {
                if (person && role3 && role4 && role5) {
                await person.roles.set([role3.id, role4.id, role5.id]);
                }
                } else {
                    if (person && role3 && role4) {
                        await person.roles.set([role3.id, role4.id]);
                        }
                }
                }
            }

                let group = await noblox.getGroup(groupid);
                let groupName = group.name;
                let groupOwner = group.owner.username;
              let avatar = await noblox.getPlayerThumbnail(id, "48x48", "png", true, "headshot");
      let avatarurl = avatar[0].imageUrl;
      
                if ((role.rank) <= MaxRankbelowBot && (role.rank) >= 1 && userrunningcommand > MinRank && (getRole.rank) >= 1 && (getRole.rank) !== role.rank && !(id === userinfo)) {
                  let embed = new EmbedBuilder()
                  .setTitle(`**Rank Management!**`)
                  .setDescription(`**Username:**\n${username}\n**UserId:**\n${id}\n**Rank Management Type:**\nSet Rank\n**New Rank:**\n${ranks}\n**Command Used By:**`)
                  .setColor('Green')
                  .setAuthor({ name: username, iconURL: avatarurl })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                  noblox.message(id, `${groupName} Rank Change`, `Hello ${username}, Your rank has been Changed in ${groupName} to ${ranks} from ${role.name}! If you have any questions please contact ${groupOwner} or the Co-Owners of the Group.`).catch((err) => {
                    console.log(err.message)
                  })
                noblox.setRank(groupid, id, getRole.rank)
                interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully Ranked **${username}** to **${ranks}**\n**This message will Auto-Delete in 10 seconds!**`,
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
                interaction.editReply({ content: `:x: **ERROR** | Failed to Rank **${username}** to **${ranks}**\n**This message will Auto-Delete in 10 seconds!**`,
        }).then(
        setTimeout(() => {
            interaction.deleteReply().catch(() => {
                return;
              })
        }, 10000)
        )
        }
            } catch (error) {
                console.log(error.message)
            }
        },
}