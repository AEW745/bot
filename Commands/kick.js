const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    PermissionsBitField
} = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders')
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: 'Kick',
    description: 'Kick a member in the Discord Server!',
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member in the Discord Server!')
    .addUserOption(option =>
        option.setName('username')
        .setDescription('User to Kick').setRequired(true)
        )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('Reason for Kick')
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
            //let serversetup = await db.get(`ServerSetup_${interaction.guild.id}`)
            let groupid = await db.get(`ServerSetup_${interaction.guild.id}.groupid`)
            await interaction.deferReply({ephemeral: true});
            /*if (!serversetup) return interaction.editReply(`:x: **ERROR** | This server hasn't been setup. Please ask the Owner to setup the bot for this server!`).then(
                setTimeout(() => {
                    interaction.deleteReply().catch(() => {
                        return;
                    })
                }, 10000)
            )*/
            const username = interaction.options.getUser('username');
            const reason = interaction.options.getString('reason') || "No Reason Provided!";
            try {
                let user = interaction.guild.members.cache.get(username.id);
                if (!interaction.member.permissions.has([PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
                if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageGuild])) return interaction.editReply(`:x: **ERROR** | I don't have permission to execute this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
                if (interaction.guild.members.me.roles.highest.position <= user.roles.highest.position) return interaction.editReply(`:x: **ERROR** | I can't Kick ${username} because they have higher permission levels over me!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
                if (interaction.member.roles.highest.position <= user.roles.highest.position) return interaction.editReply(`:x: **ERROR** | You can't Kick ${username} because they are a Higher Rank than you!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                        interaction.deleteReply().catch(() => {
                            return;
                          })
                    }, 10000)
                )
                if (interaction.member.user === username) return interaction.editReply(`:x: **ERROR** | You can't Kick yourself!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 10000)
                    )
                    if (bot.user === username) return interaction.editReply(`:x: **ERROR** | You can't Kick me!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                    if (interaction.member.user.bot = username.bot) return interaction.editReply(`:x: **ERROR** | You can't Kick other Bots!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                            interaction.deleteReply().catch(() => {
                                return;
                              })
                        }, 10000)
                    )
                if (username && reason && interaction.options.getMember('username').kickable) {
                  let embed = new EmbedBuilder()
                  .setTitle(`**Moderation Report**`)
                  .setDescription(`**Username:**\n${username.username}\n**Discriminator:**\n${username.discriminator}\n**User Mention:**\n${username}\n**UserId:**\n${username.id}\n**Moderation Type:**\nKick from Discord Server\n**Reason:**\n${reason}\n**Moderator:**`)
                  .setColor('Red')
                  .setAuthor({ name: username.username, iconURL: username.displayAvatarURL() })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                if (groupid) {
                interaction.options.getMember('username').send({ content: `You have been kicked from ${interaction.guild.name} for **"${reason}"** *You may rejoin the server by clicking [Here](https://www.roblox.com/groups/${groupid}) and click the Discord link located in Social Links!*`}).then(() => {
                interaction.options.getMember('username').kick(reason) 
                });
                } else {
                    interaction.options.getMember('username').send({ content: `You have been kicked from ${interaction.guild.name} for **"${reason}"**`}).then(() => {
                    interaction.options.getMember('username').kick(reason) 
                });
                }
                interaction.editReply({ content: `:white_check_mark: **SUCCESS** | Successfully Kicked **${username}** from the Server!\n**This message will Auto-Delete in 10 seconds!**`,
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
                interaction.editReply({ content: `:x: **ERROR** | Failed to Kick **${username}** from the Server!\n**This message will Auto-Delete in 10 seconds!**`,
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
