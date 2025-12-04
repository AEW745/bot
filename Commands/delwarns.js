const {
    Client,
    Message,
    EmbedBuilder,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    PermissionsBitField,
} = require('discord.js')
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'Delwarns',
    description: 'Delete warnings from a member in the Discord Server!',
    data: new SlashCommandBuilder()
    .setName('delwarns')
    .setDescription('Delete warnings from a member in the Discord Server!')
    .addUserOption(option =>
        option.setName('username')
        .setDescription('User to Delete Warnings').setRequired(true)
        )
    .addStringOption(option =>
        option.setName('warningid')
        .setDescription('Warning ID to delete')
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
            await interaction.deferReply({ephemeral: true});
            const username = interaction.options.getUser('username');
            const WarningId = interaction.options.getString('warningid');
            try {
                let user = interaction.guild.members.cache.get(username.id);
                if (interaction.member.user === username) return interaction.editReply(`:x: **ERROR** | You can't Delete warnings from yourself!\n**This message will Auto-Delete in 10 seconds!**`).then(
                    setTimeout(() => {
                      interaction.deleteReply().catch(() => {
                        return;
                      })
                  }, 10000)
                    )
                    if (bot.user === username) return interaction.editReply(`:x: **ERROR** | You can't Delete warnings from me!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                          interaction.deleteReply().catch(() => {
                            return;
                          })
                      }, 10000)
                        )
                    if (!interaction.member.permissions.any([PermissionsBitField.Flags.ModerateMembers])) return interaction.editReply(`**ERROR** | You don't have permission to use this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                          interaction.deleteReply().catch(() => {
                            return;
                          })
                      }, 10000)
                        )
                    if (!interaction.guild.members.me.permissions.any([PermissionsBitField.Flags.ModerateMembers])) return interaction.editReply(`**ERROR** | I don't have permission to execute this command!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                          interaction.deleteReply().catch(() => {
                            return;
                          })
                      }, 10000)
                        )
                    if (interaction.guild.members.me.roles.highest.position <= user.roles.highest.position) return interaction.editReply(`**ERROR** | I can't Delete ${username} warns because they have higher permission levels over me!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                          interaction.deleteReply().catch(() => {
                            return;
                          })
                      }, 10000)
                        )
                    if (interaction.member.user.bot = username.bot) return interaction.editReply(`**ERROR** | You can't Delete warnings from other Bots!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                          interaction.deleteReply().catch(() => {
                            return;
                          })
                      }, 10000)
                        )
                    if (interaction.member.roles.highest.position <= user.roles.highest.position) return interaction.editReply(`**ERROR** | You can't Delete ${username} warnings because they are a Higher Rank than you!\n**This message will Auto-Delete in 10 seconds!**`).then(
                        setTimeout(() => {
                          interaction.deleteReply().catch(() => {
                            return;
                          })
                      }, 10000)
                        )
                        let warnData = await db.get(`userWarnings_${interaction.guild.id}_${username.id}`);

                        if (!Array.isArray(warnData)) {
                          warnData = [];
                        }


                if (username && warnData.length > 0) {
                  if (WarningId) {
                   
                  if (!warnData.includes(WarningId)) return interaction.editReply(`:x: **ERROR** | \`${WarningId}\` doesn't exist! Please try a different warning ID or use ${'`/warnings`'} again!`)
          await db.delete(`userWarnings_${interaction.guild.id}_${username.id}_${WarningId}`);
        // Remove the warning ID from the warnData array
    warnData = warnData.filter(id => id !== WarningId);
    
    // Update the database with the modified warnData array
    await db.set(`userWarnings_${interaction.guild.id}_${username.id}`, warnData);
                interaction.editReply({ content: `**${username}** now has ${warnData.length > 0 ? warnData.length : 0} **Warnings** in the ${interaction.guild.name} Server!\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
            setTimeout(() => {
                interaction.deleteReply().catch(() => {
                  return;
                })
            }, 10000)
            )
              let embed = new EmbedBuilder()
                  .setTitle(`**Moderation Report**`)
                  .setDescription(`**Username:**\n${username.username}\n**Discriminator:**\n${username.discriminator}\n**User Tag:**\n${username.tag}\n**User Mention:**\n${username}\n**UserId:**\n${username.id}\n**Moderation Type:**\nDelete Specific Warnings\n**Number of Warnings**\n${warnData.length > 0 ? warnData.length : 0}\n**Moderator:**`)
                  .setColor('Green')
                  .setAuthor({ name: username.username, iconURL: username.displayAvatarURL() })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                  interaction.channel.send({ embeds: [embed] }).then(message => {
                    setTimeout(() => {
                      message.delete().catch(() => {
                        return;
                      })
                  }, 5000)
              })
          } else {
            await db.delete(`userWarnings_${interaction.guild.id}_${username.id}`)
            warnData = [];
            await db.set(`userWarnings_${interaction.guild.id}_${username.id}`, warnData);
                interaction.editReply({ content: `**${username}** now has ${warnData.length > 0 ? warnData.length : 0} **Warnings** in the ${interaction.guild.name} Server!\n**This message will Auto-Delete in 10 seconds!**`,
            }).then(
            setTimeout(() => {
                interaction.deleteReply().catch(() => {
                  return;
                })
            }, 10000)
            )
              let embed = new EmbedBuilder()
                  .setTitle(`**Moderation Report**`)
                  .setDescription(`**Username:**\n${username.username}\n**Discriminator:**\n${username.discriminator}\n**User Tag:**\n${username.tag}\n**User Mention:**\n${username}\n**UserId:**\n${username.id}\n**Moderation Type:**\nDelete All Warnings\n**Number of Warnings**\n${warnData.length > 0 ? warnData.length : 0}\n**Moderator:**`)
                  .setColor('Green')
                  .setAuthor({ name: username.username, iconURL: username.displayAvatarURL() })
                  .setFooter({ text: `${interaction.member.user.username} | This message will Auto-Delete in 5 seconds!`, iconURL: interaction.member.user.displayAvatarURL() })
                  .setTimestamp(Date.now());
                  interaction.channel.send({ embeds: [embed] }).then(message => {
                    setTimeout(() => {
                      message.delete().catch(() => {
                        return;
                      })
                  }, 5000)
              })
          }
                  } else {
                interaction.editReply({ content: `Failed to Delete **${username}** Warnings in the ${interaction.guild.name} Server!\n**This message will Auto-Delete in 10 seconds!**`,
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
