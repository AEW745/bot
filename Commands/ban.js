const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    PermissionsBitField,
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Ban',
    description: 'Ban a member in the Discord Server!',
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member in the Discord Server!')
    .addUserOption(option =>
        option.setName('username')
        .setDescription('User to Ban').setRequired(true)
        )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('Reason for Ban')),
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
            await interaction.deferReply({ephemeral: true});
            if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`)
            const username = interaction.options.getUser('username')
            let reason = interaction.options.getString('reason') || "No Reason Provided!";
            try {
              await interaction.guild.members.fetch()
            .then(async members => {
                let user = interaction.guild.members.cache.get(username.id);
                let BannedId = members.find(member => member.user.id == username.id);
                if (!interaction.member.permissions.has([PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
                if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | I don't have permission to execute this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
                if (!BannedId) return await interaction.editReply({ content: `:x: **ERROR** | Can't find **${username}** in ${interaction.guild.name}\n**This message will Auto-Delete in 10 seconds!**`}).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
                    if (interaction.member.user === username) return interaction.editReply(`:x: **ERROR** | You can't Ban yourself!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                    if (bot.user === username) return interaction.editReply(`:x: **ERROR** | You can't Ban me!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                    if (interaction.guild.members.me.roles.highest.position < user.roles.highest.position) return interaction.editReply(`:x: **ERROR** | I can't Ban ${username} because they have higher permission levels over me!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                    if (interaction.member.user.bot = username.bot) return interaction.editReply(`:x: **ERROR** | You can't Ban other Bots!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                    if (interaction.member.roles.highest.position < user.roles.highest.position) return interaction.editReply(`:x: **ERROR** | You can't Ban ${username} because they are a Higher Rank than you!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                if (username && reason) {
                  let embed = new EmbedBuilder()
                  .setTitle(`**Moderation Report**`)
                  .setDescription(`**Username:**\n${username.username}\n**Discriminator:**\n${username.discriminator}\n**User Tag:**\n${username.tag}\n**User Mention:**\n${username}\n**UserId:**\n${username.id}\n**Moderation Type:**\nBan User\n**Reason:**\n${reason}\n**Moderator:**`)
                  .setColor('Red')
                  .setAuthor({ name: username.username, iconURL: username.displayAvatarURL() })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
               BannedId.ban({ reason: reason })
                interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully Banned **${username}** from the Server!\n**This message will Auto-Delete in 10 seconds!**`,
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
            interaction.editReply({ content: `:x: **ERROR** | Failed to Ban **${username}** from the Server!\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
            setTimeout(() => {
                interaction.deleteReply().catch(() => {
                    return;
                  })
            }, 10000)
            )
        }
        })
            } catch (error) {
                console.log(error.message)
            }
        },
}
