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
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Groupunban',
    description: 'Unban a member from the Roblox Group.',
    data: new SlashCommandBuilder()
    .setName('groupunban')
    .setDescription('Unban a member from the Roblox Group.')
    .addStringOption(option =>
        option.setName('username')
        .setDescription('User to Unban').setRequired(true)
        .setAutocomplete(true)
        )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('Reason for Unbanning from Group')
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
            let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            let logssetup = await db.get(`LogsSetup_${interaction.guild.id}`)
            await interaction.deferReply({ephemeral: true});
            if (!serversetup && logssetup) return interaction.editReply(`**:x: ERROR** | This a ROBLOX Command. Roblox Commands haven't been setup! Please ask the Owner to setup the bot for Roblox Commands!`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
            )
            const username = interaction.options.getString('username');
            const reason = interaction.options.getString('reason') || "No Reason Provided";
            let userinfo = await db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.user.id}.robloxid`);
            let currentuser = await db.get(`RobloxInfo_${interaction.guild.id}_${interaction.member.user.id}.robloxusername`);
            try {
                let groupid = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
                await noblox.setCookie(await db.get(`ServerSetup_${interaction.guild.id}.rblxcookie`)).catch((err) => {
                    console.log(err)
                })
                let minrank = await db.get(`ServerSetup_${interaction.guild.id}.minrank`)
                let serverlogs = await db.get(`LogsSetup_${interaction.guild.id}.serverlogs`)
                if (!(userinfo && currentuser)) return interaction.editReply({ content: `:x: **ERROR** | You and ${username} must be Verified to run this command!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 10000)
                    )
                const groupunbanchannel = await bot.guilds.cache.get(interaction.guild.id).channels.cache.get(serverlogs);
                let id;
                let rank;
                let role;
                try {
                id = await noblox.getIdFromUsername(username)
                rank = await noblox.getRankInGroup(groupid, id)
                role = await noblox.getRole(groupid, rank)
                } catch (error) {
                    return interaction.editReply({ content: `**${username}** is not a Valid username! Please enter a Valid username!\n**This message will Auto-Delete in 10 seconds!**`}).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                            })
                        }, 10000)
                    )
                }
                const groupbot = (await noblox.getAuthenticatedUser()).id
                const botrank = await noblox.getRankInGroup(groupid, groupbot)
                const botrole = await noblox.getRole(groupid, botrank)
                const MaxRankforGroupUnbanning = botrole.rank - 2;
                const MinRank = minrank;
                const currentuserid = await noblox.getIdFromUsername(currentuser)
                const currentuserrank = await noblox.getRankInGroup(groupid, currentuserid)
                const currentuserrole = await noblox.getRole(groupid, currentuserrank)
                const userrunningcommand = currentuserrole.rank;
                let avatar = await noblox.getPlayerThumbnail(id, "48x48", "png", true, "headshot");
      let avatarurl = avatar[0].imageUrl;
                const embed = new EmbedBuilder()
                .setTitle(`**User Group Unban!**`)
                .setDescription(`**User**\n${username}\n**UserID**\n${id}\n**Group Unban Reason**\n${reason}\n**Links**\n[Group](https://www.roblox.com/groups/${groupid})\n[Profile](https://www.roblox.com/users/${id}/profile)\n**Moderator:**`)
                .setColor('Red')
                .setAuthor({ name: username, iconURL: avatarurl })
                .setFooter({ text: interaction.member.user.username, iconURL: interaction.member.user.displayAvatarURL() })
                .setTimestamp(Date.now())
              let embed2 = new EmbedBuilder()
                  .setTitle(`**Rank Management!**`)
                  .setDescription(`**Username:**\n${username}\n**UserId:**\n${id}\n**Rank Management Type:**\nUnban from Roblox Group\n**Reason:**\n${reason}!\n**Moderator:**`)
                  .setColor('Red')
                  .setAuthor({ name: username, iconURL: avatarurl })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                if ((role.rank) <= MaxRankforGroupUnbanning && userrunningcommand > MinRank && !(id === userinfo)) {
                noblox.unban(groupid, id)
                interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully Unbanned **${username}** from the Roblox Group!\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
            setTimeout(() => {
                if (interaction) {
                interaction.deleteReply()
                }
            }, 10000)
            )
                interaction.channel.send({ embeds: [embed2] }).then(message => {
                    setTimeout(() => {
                        if (message) {
                      message.delete()
                        }
                  }, 5000)
              })
                groupunbanchannel.send({ embeds: [embed] })
        } else {
                interaction.editReply({ content: `Failed to Unban **${username}** from the Roblox Group!\n**This message will Auto-Delete in 10 seconds!**`,
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
            }
        },
}
